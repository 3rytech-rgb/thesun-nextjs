import { WPPost } from '../../types/wordpress';

export interface SpecialSection {
  name: string;
  slug: string;
  tagline?: string;
  backgroundColor?: string;
  textColor?: string;
  backgroundImage?: string;
  accentColor?: string;
}