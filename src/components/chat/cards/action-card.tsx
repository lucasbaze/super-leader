import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ActionCardProps {
  person?: {
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
  };
  interaction?: {
    person_id: string;
    type: string;
    note?: string;
    person_name: string;
  };
  onConfirm: () => void;
  onCancel: () => void;
  completed?: boolean;
}

export function ActionCard({
  person,
  interaction,
  onConfirm,
  onCancel,
  completed = false
}: ActionCardProps) {
  if (person) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create New Person</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <div>
            <span className='font-medium'>Name: </span>
            {person.first_name} {person.last_name}
          </div>
          {person.email && (
            <div>
              <span className='font-medium'>Email: </span>
              {person.email}
            </div>
          )}
          {person.phone && (
            <div>
              <span className='font-medium'>Phone: </span>
              {person.phone}
            </div>
          )}
        </CardContent>
        {!completed && (
          <CardFooter className='flex justify-end gap-2'>
            <Button variant='outline' onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onConfirm}>Create Person</Button>
          </CardFooter>
        )}
      </Card>
    );
  }

  if (interaction) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create New Interaction</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <div>
            <span className='font-medium'>For: </span>
            {interaction.person_name}
          </div>
          <div>
            <span className='font-medium'>Type: </span>
            {interaction.type}
          </div>
          {interaction.note && (
            <div>
              <span className='font-medium'>Note: </span>
              <p className='bg-muted/30 mt-1 whitespace-pre-wrap rounded-md p-2 text-muted-foreground'>
                {interaction.note}
              </p>
            </div>
          )}
        </CardContent>
        {!completed && (
          <CardFooter className='flex justify-end gap-2'>
            <Button variant='outline' onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onConfirm}>Create Interaction</Button>
          </CardFooter>
        )}
      </Card>
    );
  }

  return null;
}
