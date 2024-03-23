import { Test, TestingModule } from '@nestjs/testing';
import { CacheSystemService } from './cache-system.service';

describe('CacheSystemService', () => {
  let service: CacheSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CacheSystemService],
    }).compile();

    service = module.get<CacheSystemService>(CacheSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
