import { Globe, Mail, MapPin, Phone } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import type { Database } from '@/types/database';

type Person = Database['public']['Tables']['person']['Row'];
type ContactMethod = Database['public']['Tables']['contact_methods']['Row'];
type Address = Database['public']['Tables']['addresses']['Row'];
type Website = Database['public']['Tables']['websites']['Row'];

interface BioSidebarData {
  person: Person;
  contactMethods: ContactMethod[];
  addresses: Address[];
  websites: Website[];
}

interface PersonBioSidebarProps {
  data: BioSidebarData | undefined;
}

export function PersonBioSidebar({ data }: PersonBioSidebarProps) {
  if (!data) return null;

  return (
    <div className='flex flex-col space-y-8 overflow-y-auto'>
      {/* Bio Section */}
      {data.person.bio && (
        <section className='space-y-3'>
          <h3 className='text-sm font-semibold text-muted-foreground'>Bio</h3>
          <p className='text-sm'>{data.person.bio}</p>
        </section>
      )}

      {/* Contact Methods */}
      <section className='space-y-3'>
        <h3 className='text-sm font-semibold text-muted-foreground'>Contact Information</h3>
        <div className='space-y-3'>
          {data.contactMethods.map((method) => (
            <div key={method.id} className='flex items-start space-x-2'>
              {method.type === 'email' && <Mail className='mt-1 h-3.5 w-3.5 text-muted-foreground' />}
              {method.type === 'phone' && <Phone className='mt-1 h-3.5 w-3.5 text-muted-foreground' />}
              <div className='flex-1'>
                <p className='text-sm'>{method.value}</p>
                <div className='flex items-center gap-2'>
                  <span className='text-xs text-muted-foreground'>{method.label}</span>
                  {method.is_primary && (
                    <Badge variant='secondary' className='h-4 px-1 py-0 text-[10px]'>
                      Primary
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Addresses */}
      <section className='space-y-3'>
        <h3 className='text-sm font-semibold text-muted-foreground'>Addresses</h3>
        <div className='space-y-3'>
          {data.addresses.map((address) => (
            <div key={address.id} className='flex items-start space-x-2'>
              <MapPin className='mt-1 h-3.5 w-3.5 text-muted-foreground' />
              <div>
                <p className='text-sm'>{address.street}</p>
                <div className='flex items-center gap-2'>
                  <span className='text-xs text-muted-foreground'>
                    {address.city}, {address.state} {address.country}
                  </span>
                  {address.is_primary && (
                    <Badge variant='secondary' className='h-4 px-1 py-0 text-[10px]'>
                      Primary
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Websites */}
      {data.websites.length > 0 && (
        <section className='space-y-3'>
          <h3 className='text-sm font-semibold text-muted-foreground'>Websites & Social</h3>
          <div className='space-y-2'>
            {data.websites.map((website) => (
              <div key={website.id} className='flex items-center space-x-2'>
                <Globe className='h-3.5 w-3.5 text-muted-foreground' />
                <a
                  href={website.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-sm text-primary hover:underline'>
                  {website.label || website.url}
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Record Details */}
      <section className='space-y-3'>
        <h3 className='text-sm font-semibold text-muted-foreground'>Record Details</h3>
        <div className='space-y-1 text-xs text-muted-foreground'>
          <p>Last Updated: {new Date(data.person.updated_at).toLocaleDateString()}</p>
          <p>Created: {new Date(data.person.created_at).toLocaleDateString()}</p>
        </div>
      </section>
    </div>
  );
}
