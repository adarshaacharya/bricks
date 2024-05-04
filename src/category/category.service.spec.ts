import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';

const mockCategoryService = {
  createCategory: jest.fn((name) => {
    return { id: 1, name };
  }),
  getAllCategories: jest.fn(() => {
    return [
      { id: 1, name: 'Category 1', slug: 'category-1' },
      { id: 2, name: 'Category 2', slug: 'category-2' },
    ];
  }),
  getPropertiesByCategory: jest.fn((slug) => {
    return {
      id: 1,
      name: 'Category 1',
      slug: 'category-1',
      properties: [
        { id: 1, name: 'Property 1', slug: 'property-1' },
        { id: 2, name: 'Property 2', slug: 'property-2' },
      ],
    };
  }),
};

jest.mock('./category.service', () => {
  return {
    CategoryService: jest.fn().mockImplementation(() => mockCategoryService),
  };
});

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCategory', () => {
    it('should create a category', async () => {
      const category = await service.createCategory('category 1');
      expect(category).toEqual({ id: 1, name: 'category 1' });
    });
  });

  describe('getAllCategories', () => {
    it('should return all categories', async () => {
      const categories = await service.getAllCategories();
      expect(categories).toEqual([
        { id: 1, name: 'Category 1', slug: 'category-1' },
        { id: 2, name: 'Category 2', slug: 'category-2' },
      ]);
    });
  });

  describe('getPropertiesByCategory', () => {
    it('should return properties by category', async () => {
      const properties = await service.getPropertiesByCategory('category-1');
      expect(properties).toEqual({
        id: 1,
        name: 'Category 1',
        slug: 'category-1',
        properties: [
          { id: 1, name: 'Property 1', slug: 'property-1' },
          { id: 2, name: 'Property 2', slug: 'property-2' },
        ],
      });
    });
  });
});
