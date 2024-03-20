import { Injectable } from '@nestjs/common';
import slugify from 'slugify';

@Injectable()
export class SlugProvider {
  async slugify(slug: string) {
    return slugify(slug, {
      replacement: '-',
      lower: true,
    });
  }
}
