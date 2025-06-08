export interface UnipileUserRelation {
  object: 'UserRelation';
  connection_urn: string;
  created_at: number;
  first_name: string;
  last_name: string;
  member_id: string;
  member_urn: string;
  headline: string;
  public_identifier: string;
  public_profile_url: string;
  profile_picture_url?: string;
}

export interface UnipileRelationsResponse {
  relations: UnipileUserRelation[];
  next_cursor: string | null;
  has_more: boolean;
}
