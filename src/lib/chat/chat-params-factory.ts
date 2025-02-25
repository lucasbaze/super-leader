export type ChatParams = {
  type: string;
  id?: string;
  personId?: string;
  groupId?: string;
};

export function createApiBody(params: ChatParams, extraData: Record<string, any> = {}) {
  return {
    ...(params.personId && { personId: params.personId }),
    ...(params.groupId && { groupId: params.groupId }),
    ...extraData
  };
}
