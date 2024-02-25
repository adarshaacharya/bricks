import { Test, TestingModule } from '@nestjs/testing';
import { PassHasherService } from './pass-hasher.service';

describe('PassHasherService', () => {
  let service: PassHasherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PassHasherService],
    }).compile();

    service = module.get<PassHasherService>(PassHasherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
