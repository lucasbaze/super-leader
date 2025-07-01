// src/services/people/csv-import-people.ts
import { stripIndents } from 'common-tags';
import { parse } from 'csv-parse';
import { Readable } from 'stream';
import { z } from 'zod';

import { createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import {
  CreateExtendedPersonLLMInput,
  createExtendedPersonLLMInputSchema,
  createExtendedPersonLLMInputSchemaWithoutOptional
} from '@/lib/schemas/person-create';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';
import { createServiceRoleClient } from '@/utils/supabase/service-role';
import { generateObject } from '@/vendors/ai';

import { createPerson } from '../person/create-person';

// Define errors
export const ERRORS = {
  CSV_IMPORT: {
    PARSE_ERROR: createError(
      'csv_parse_error',
      ErrorType.VALIDATION_ERROR,
      'Failed to parse CSV file',
      'Unable to process the CSV file'
    ),
    TRANSFORM_ERROR: createError(
      'csv_transform_error',
      ErrorType.API_ERROR,
      'Failed to transform CSV data',
      'Unable to transform the CSV data'
    ),
    VALIDATION_ERROR: createError(
      'csv_validation_error',
      ErrorType.VALIDATION_ERROR,
      'Invalid CSV data',
      'Some records could not be imported due to validation errors'
    ),
    FILE_DOWNLOAD_ERROR: createError(
      'file_download_error',
      ErrorType.API_ERROR,
      'Failed to download file from storage',
      'Unable to access the uploaded file'
    )
  }
};

const peopleSchema = z.array(createExtendedPersonLLMInputSchemaWithoutOptional);

// Schema for the AI transformation response
const csvTransformSchema = z.object({
  people: peopleSchema
});

interface ProcessCSVChunkParams {
  headers: string[];
  rows: string[][];
  userId: string;
}

async function processCSVChunk({
  headers,
  rows,
  userId
}: ProcessCSVChunkParams): Promise<ServiceResponse<CreateExtendedPersonLLMInput[]>> {
  try {
    // Create a prompt for the AI to transform the data
    const prompt = stripIndents`
      Transform the following CSV data into a structured format matching our schema.
      The data should be transformed into an array of person objects with their related data.

      The user_id is ${userId}

      Headers: ${headers.join(', ')}

      Rows:
      ${rows.map((row) => row.join(', ')).join('\n')}

      Guidelines:
      - Map the CSV columns to the appropriate fields based on the schema
      - Handle missing or empty values appropriately with empty strings to ensure the schema is followed
      - Ensure all required fields are present
      - Format dates consistently in the format of YYYY-MM-DD
      - Handle multiple values in a single cell (e.g., multiple email addresses) by creating separate contact_methods
      - Create appropriate labels for addresses, contact methods, and websites
      - Set is_primary flags appropriately
      - If a field is not present, use an empty string to ensure the schema is followed
      - If a category like websites is not present, use an empty array to ensure the schema is followed
    `;

    // Call the AI to transform the data
    const response = await generateObject({
      prompt,
      schema: csvTransformSchema
    });

    if (!response) {
      return {
        data: null,
        error: {
          ...ERRORS.CSV_IMPORT.TRANSFORM_ERROR,
          details: 'No response from AI service'
        }
      };
    }

    // Validate the transformed data
    const validationResult = peopleSchema.safeParse(response.people);

    if (!validationResult.success) {
      return {
        data: null,
        error: {
          ...ERRORS.CSV_IMPORT.VALIDATION_ERROR,
          details: validationResult.error.format()
        }
      };
    }

    return { data: validationResult.data, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        ...ERRORS.CSV_IMPORT.TRANSFORM_ERROR,
        details: error
      }
    };
  }
}

export interface ImportCSVParams {
  db: DBClient;
  filePath: string;
  userId: string;
  chunkSize?: number;
}

export async function importCSV({
  db,
  filePath,
  userId,
  chunkSize = 10
}: ImportCSVParams): Promise<ServiceResponse<{ processed: number; errors: any[] }>> {
  const errors: any[] = [];
  let processed = 0;

  try {
    // Download the file from Supabase storage
    const supabase = await createServiceRoleClient();
    const { data: fileData, error: downloadError } = await supabase.storage.from('imports').download(filePath);

    if (downloadError || !fileData) {
      const serviceError = {
        ...ERRORS.CSV_IMPORT.FILE_DOWNLOAD_ERROR,
        details: downloadError
      };
      errorLogger.log(serviceError);
      return { data: null, error: serviceError };
    }

    // Convert the blob to a readable stream
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = Readable.from(buffer);

    // Create a parser with headers
    const parser = stream.pipe(
      parse({
        columns: true,
        skip_empty_lines: true,
        trim: true
      })
    );

    let headers: string[] = [];
    let currentChunk: string[][] = [];

    // Process the CSV in chunks
    for await (const record of parser) {
      if (headers.length === 0) {
        headers = Object.keys(record);
      }

      currentChunk.push(Object.values(record));

      if (currentChunk.length >= chunkSize) {
        const result = await processCSVChunk({
          headers,
          rows: currentChunk,
          userId
        });

        if (result.error) {
          errors.push(result.error);
        } else if (result.data) {
          for (const person of result.data) {
            const createResult = await createPerson({
              db: db,
              userId,
              data: person
            });
            console.log('createResult', createResult);
          }

          // // Here you would call bulkImportPeople with the transformed data
          // // For now, we'll just count the processed records
          // const bulkImportResult = await createPerson({
          //   db: db,
          //   userId,
          //   people: result.data
          // });

          processed += result.data.length;
        }

        currentChunk = [];
      }
    }

    // Process any remaining records
    if (currentChunk.length > 0) {
      const result = await processCSVChunk({
        headers,
        rows: currentChunk,
        userId
      });

      if (result.error) {
        errors.push(result.error);
      } else if (result.data) {
        processed += result.data.length;
      }
    }

    return {
      data: {
        processed,
        errors
      },
      error: errors.length > 0 ? ERRORS.CSV_IMPORT.VALIDATION_ERROR : null
    };
  } catch (error) {
    const serviceError = {
      ...ERRORS.CSV_IMPORT.PARSE_ERROR,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}
