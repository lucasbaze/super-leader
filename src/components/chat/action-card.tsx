import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ActionCardProps {
  person: {
    first_name: string;
    last_name?: string;
    note: string;
    date_met?: string;
  };
  onConfirm: () => void;
  onCancel: () => void;
}

export function ActionCard({ person, onConfirm, onCancel }: ActionCardProps) {
  return (
    <Card className='mx-auto my-2 w-full max-w-md'>
      <CardHeader>
        <CardTitle>
          Create Contact: {person.first_name} {person.last_name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          <p className='text-sm text-muted-foreground'>Note</p>
          <p className='text-sm'>{person.note}</p>
          {person.date_met && (
            <>
              <p className='text-sm text-muted-foreground'>Date Met</p>
              <p className='text-sm'>{new Date(person.date_met).toLocaleDateString()}</p>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className='flex justify-end gap-2'>
        <Button variant='ghost' onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onConfirm}>Create Contact</Button>
      </CardFooter>
    </Card>
  );
}
