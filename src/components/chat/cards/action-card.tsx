// import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import { PendingAction } from '@/hooks/chat/use-chat-interface';
import { useCreatePerson } from '@/hooks/use-people';
import { CHAT_TOOLS } from '@/lib/chat/tools/constants';

// import { routes } from '@/lib/routes';

export interface ActionCardProps {
  pendingAction: PendingAction;
  setPendingAction: (action: PendingAction) => void;
  addToolResult: (result: { toolCallId: string; result: string }) => void;
  person?: {
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
  };
  completed?: boolean;
}

export function ActionCard({
  pendingAction,
  setPendingAction,
  addToolResult,
  person,
  completed = false
}: ActionCardProps) {
  const createPerson = useCreatePerson();
  // const router = useRouter();

  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    try {
      if (pendingAction.name === CHAT_TOOLS.CREATE_PERSON) {
        const result = await createPerson.mutateAsync(pendingAction.arguments);
        console.log('Create Person result:', result);
        addToolResult({ toolCallId: pendingAction.toolCallId, result: 'Yes' });

        // Show toast with link to new person
        // TODO: Need to fix this, so that it's working properly
        toast.success(
          <div className='flex flex-col gap-2'>
            <p>
              Successfully created {pendingAction.arguments.first_name}{' '}
              {pendingAction.arguments.last_name}
            </p>
            {/* TODO: Show the newly created person */}
            {/* <Button
              variant='outline'
              size='sm'
              onClick={() => router.push(routes.person.activity({ id: result.data?.id || '' }))}>
              View Profile
            </Button> */}
          </div>
        );
      }
      setPendingAction(null);
    } catch (error) {
      console.error('Error handling action:', error);
      toast.error('Failed to create. Please try again.');
    }
  };

  const handleCancelAction = useCallback(() => {
    if (!pendingAction) return;
    addToolResult({ toolCallId: pendingAction.toolCallId, result: 'Cancelled action' });
    setPendingAction(null);
  }, [pendingAction, addToolResult]);

  if (person) {
    return (
      <Card className='shadow-none'>
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
            <Button variant='outline' onClick={handleCancelAction}>
              Cancel
            </Button>
            <Button onClick={handleConfirmAction}>Create Person</Button>
          </CardFooter>
        )}
      </Card>
    );
  }

  return null;
}
