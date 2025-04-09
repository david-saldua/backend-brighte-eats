
# Best Practices

## Code Style & Quality
### Principles

- Follow SOLID principles in all code
- Apply Clean Architecture patterns
- Implement Single Level of Abstraction Principle (SLAP)
- Use Dependency Injection for better testability and decoupling
- Use the Keep it Simple Stupid (KISS) principle

### Naming Conventions

- Use **camelCase** for variables, properties, functions, and GraphQL fields
- Use **PascalCase** for classes, interfaces, types, enums, Prisma models, and GraphQL types
- Use **UPPER_SNAKE_CASE** for constants and environment variables
- Prefix interfaces with `I` (e.g., `IUserService`)
- Suffix service classes with `Service` (e.g., `UserService`)
- Suffix DTOs with purpose (e.g., `CreateUserInput`, `UpdateUserInput`)
- Suffix GraphQL input types with `Input` (e.g., `UserInput`, `FilterInput`)
- Suffix GraphQL object types with their domain name (e.g., `User`, `Post`)
- Suffix repositories with `Repository` (e.g., `UserRepository`)
- Use verb prefixes for mutations (e.g., `createUser`, `updateUser`, `deleteUser`)
- Use noun forms for queries (e.g., `user`, `users`, `usersByRole`)

### Code Documentation

- Add JSDoc comments to all methods and classes
- Focus on "why" not "what" in comments
- Document non-obvious behaviors and edge cases
- Use TypeScript types instead of comments where possible
- Include examples in complex function documentation

```typescript
/**
 * Authenticates a user and returns JWT token
 *
 * @param loginInput - User login credentials
 * @returns JWT token object with access and refresh tokens
 * @throws UnauthorizedException - When credentials are invalid
 */
async login(loginInput: LoginInput): Promise<AuthPayload> {
  // Implementation
}
```

### Linting & Formatting

- Use ESLint with the recommended NestJS configuration
- Use Prettier for consistent code formatting

## Architecture & Design Patterns

### Domain-Driven Design

- Organize code around business domains
- Use bounded contexts to define module boundaries
- Apply ubiquitous language across codebase
- Implement value objects for complex data structures

### Layered Architecture

- **Resolvers**: Handle GraphQL operations, similar to controllers in REST
- **Services**: Contain business logic, coordinate across repositories
- **Repositories**: Handle data access and persistence, return Prisma models
- **Types**: Define GraphQL types, inputs, and payloads

### Repository-Service-Resolver Pattern

- **Repositories** are responsible for data access only
- **Services** contain all business logic
- **Resolvers** handle GraphQL operations and delegate to services
- Repositories return Prisma models directly to services
- Services transform data for resolvers when needed

```typescript
// Repository example
@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.users.findUnique({
      where: { id },
    });
  }
}

// Service example
@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  // Business logic methods
  async verifyPassword(user: User, plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, user.password);
  }
}

// Resolver example
@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => User)
  async user(@Args('id') id: string): Promise<User> {
    return this.userService.findById(id);
  }
}
```

## GraphQL API Design & Documentation

### Schema Design

- Follow GraphQL naming conventions (camelCase for fields, PascalCase for types)
- Design schema with a focus on client needs, not server implementation
- Use meaningful and consistent naming across the schema
- Implement proper pagination with connections pattern
- Use custom scalars for specialized data types (DateTime, JSON, etc.)
- Implement proper error handling with union types or error extensions

### Type Definitions

- Use code-first approach with NestJS decorators
- Define clear and concise GraphQL types
- Use interfaces for shared fields
- Implement proper input validation with class-validator
- Document all types, fields, and arguments

```typescript
@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  name: string;

  @Field(() => [Post], { nullable: true })
  posts?: Post[];

  @Field(() => Date)
  createdAt: Date;
}

@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(2)
  name: string;

  @Field()
  @MinLength(8)
  password: string;
}
```

### Resolvers

- Organize resolvers by domain
- Implement field resolvers for related data
- Use DataLoader for N+1 query prevention
- Handle authorization at resolver level
- Document queries and mutations with descriptions

```typescript
@Resolver(() => User)
export class UserResolver {
  constructor(
    private userService: UserService,
    private postService: PostService,
  ) {}

  @Query(() => User, { description: 'Get a user by ID' })
  async user(@Args('id') id: string): Promise<User> {
    return this.userService.findById(id);
  }

  @Mutation(() => User, { description: 'Create a new user' })
  async createUser(@Args('input') input: CreateUserInput): Promise<User> {
    return this.userService.create(input);
  }

  @ResolveField(() => [Post], { description: 'Get all posts by this user' })
  async posts(@Parent() user: User): Promise<Post[]> {
    return this.postService.findByUserId(user.id);
  }
}
```

### API Documentation

- Use GraphQL schema descriptions for documentation
- Implement `@nestjs/graphql` decorators for auto-generated docs
- Document all types, fields, queries, and mutations
- Add meaningful descriptions to all schema properties
- Include authentication requirements in documentation
- Provide example queries and mutations

```typescript
@ObjectType({ description: 'User account information' })
export class User {
  @Field(() => ID, { description: 'Unique identifier' })
  id: string;

  @Field({ description: 'Email address (used for login)' })
  email: string;
}

@Query(() => User, { 
  description: 'Get user by ID',
  deprecationReason: 'Use userByEmail instead' // When applicable
})
async user(@Args('id') id: string): Promise<User> {
  // Implementation
}
```

## Project Structure

### Feature Module Structure

```
src/
  feature-name/
    dto/              # GraphQL input and object types
    interfaces/       # TypeScript interfaces
    repositories/     # Data access repositories
    resolvers/        # GraphQL resolvers
    services/         # Business logic services
    feature-name.module.ts
```

### Common Module

- Create a common module for shared functionality
- Include guards, interceptors, decorators, and directives
- Share common types and interfaces

## Database Practices

### Prisma Usage

- Use Prisma as the primary ORM
- Create a globally available PrismaService
- Implement proper connection lifecycle management
- Implement database migration strategy

### Prisma Type Safety

- Import generated types from Prisma Client to ensure type safety:
  ```typescript
  import { Prisma, User, Post } from '@prisma/client';
  ```

- Use Prisma's generated input types for create, update, and query operations:
  ```typescript
  // Create operation with type safety
  const createUserInput: Prisma.UserCreateInput = {
    email: 'user@example.com',
    name: 'John Doe',
    posts: {
      create: [{ title: 'My first post' }]
    }
  };
  
  // Update operation with type safety
  const updateUserInput: Prisma.UserUpdateInput = {
    email: 'updated@example.com',
    posts: {
      connect: [{ id: 1 }]
    }
  };
  
  // Where conditions with type safety
  const whereCondition: Prisma.UserWhereInput = {
    AND: [
      { email: { contains: '@example.com' } },
      { posts: { some: { title: { contains: 'prisma' } } } }
    ]
  };
  ```

- Use explicit return types in repository methods:
  ```typescript
  async findUserWithPosts(id: number): Promise<User & { posts: Post[] }> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { posts: true }
    });
  }
  ```

- Leverage Prisma's type utilities (available in Prisma 4.9.0+):
  ```typescript
  // Get arguments type for a specific operation
  type CreateUserArgs = Prisma.Args<typeof prisma.user, 'create'>;
  
  // Get result type for a specific operation
  type UserWithPosts = Prisma.Result<
    typeof prisma.user,
    { include: { posts: true } },
    'findUnique'
  >;
  ```

- Use the Prisma validator for input validation:
  ```typescript
  const userValidator = Prisma.validator<Prisma.UserCreateInput>();
  const validData = userValidator({
    email: 'valid@example.com',
    name: 'Valid User'
  });
  ```

- Type-safe selection of fields:
  ```typescript
  const userSelect: Prisma.UserSelect = {
    id: true,
    email: true,
    posts: {
      select: {
        id: true,
        title: true
      }
    }
  };
  
  const user = await prisma.user.findUnique({
    where: { id: 1 },
    select: userSelect
  });
  ```

- Use type-safe pagination:
  ```typescript
  const paginationArgs: Prisma.UserFindManyArgs = {
    skip: 0,
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { posts: true }
  };
  
  const users = await prisma.user.findMany(paginationArgs);
  ```

- Distinguish between "safe" and "unchecked" inputs:
  ```typescript
  // Safe input - uses relations
  const safeInput: Prisma.PostCreateInput = {
    title: 'New Post',
    author: {
      connect: { id: 1 }
    }
  };
  
  // Unchecked input - uses direct scalar fields
  const uncheckedInput: Prisma.PostUncheckedCreateInput = {
    title: 'New Post',
    authorId: 1
  };
  ```

- Implement generic repository patterns with type safety:
  ```typescript
  export class GenericRepository<
    T,
    CreateInput,
    UpdateInput,
    WhereUniqueInput
  > {
    constructor(
      private readonly model: any,
      private readonly prisma: PrismaService
    ) {}
  
    async create(data: CreateInput): Promise<T> {
      return this.prisma[this.model].create({ data });
    }
  
    async update(where: WhereUniqueInput, data: UpdateInput): Promise<T> {
      return this.prisma[this.model].update({ where, data });
    }
  }
  
  // Implementation
  type UserRepo = GenericRepository<
    User,
    Prisma.UserCreateInput,
    Prisma.UserUpdateInput,
    Prisma.UserWhereUniqueInput
  >;
  ```

- Use type-safe transactions:
  ```typescript
  async createUserWithPosts(
    userData: Prisma.UserCreateInput,
    postData: Prisma.PostCreateInput[]
  ): Promise<User> {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: userData });
      
      for (const post of postData) {
        await tx.post.create({
          data: {
            ...post,
            author: { connect: { id: user.id } }
          }
        });
      }
      
      return user;
    });
  }
  ```

- Create interfaces for complex return types from repositories:
  ```typescript
  interface UserWithMetadata {
    user: User & { posts: Post[] };
    postCount: number;
    lastActive: Date;
  }
  
  async getUserWithMetadata(id: number): Promise<UserWithMetadata> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { posts: true }
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    
    return {
      user,
      postCount: user.posts.length,
      lastActive: new Date()
    };
  }
  ```

- Implement strict type-checking for enums:
  ```typescript
  // Using generated Prisma enums
  import { Role } from '@prisma/client';
  
  function isAdmin(role: Role): boolean {
    return role === 'ADMIN';
  }
  ```

```typescript
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private configService: ConfigService) {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (this.configService.get('NODE_ENV') !== 'production') {
      // Implementation for clearing database (for testing)
    }
  }
}
```

### Database Schema Design

- Use descriptive model and field names
- Implement proper foreign key relationships
- Use appropriate data types
- Add proper indexes for performance
- Use cascading operations where appropriate
- Use enums for predefined values

### Data Access Patterns

- Create repository classes for database operations
- Implement data access methods in repositories, not services
- Use GraphQL input types for data input
- Return Prisma models directly from repositories
- Handle database-specific errors in repositories

```typescript
@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.users.findUnique({
      where: { id },
    });
  }

  async create(data: CreateUserInput): Promise<User> {
    try {
      return await this.prisma.users.create({
        data,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('User with this email already exists');
      }
      throw error;
    }
  }
}
```

## Security

### Authentication & Authorization

- Implement JWT-based authentication
- Store passwords using bcrypt with appropriate salt rounds
- Implement role-based access control (RBAC)
- Use guards for protecting GraphQL operations
- Implement field-level authorization with directives or custom decorators

```typescript
@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: User): Promise<User> {
    return user;
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateUserRole(
    @Args('id') id: string,
    @Args('role') role: UserRole
  ): Promise<User> {
    return this.userService.updateRole(id, role);
  }
}
```

### Input Validation

- Validate all input data using class-validator
- Implement request sanitization
- Use global validation pipe

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Strip properties not defined in input type
    forbidNonWhitelisted: true, // Throw error on unknown properties
    transform: true, // Transform payload to input type instance
    transformOptions: { enableImplicitConversion: true },
  }),
);
```

## Testing

### Unit Tests

- Write tests for all business logic in services
- Use Jest for testing framework
- Mock external dependencies
- Test edge cases and error scenarios

```typescript
describe('UserService', () => {
  let service: UserService;
  let userRepository: MockType<UserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(UserRepository);
  });

  it('should create a user', async () => {
    // Test implementation
  });
});
```

### Integration Tests

- Test GraphQL operations end-to-end
- Use supertest or Apollo Server testing utilities
- Set up test database
- Run tests in isolation

```typescript
describe('UserResolver (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should get user by id', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query {
            user(id: "1") {
              id
              name
              email
            }
          }
        `,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.user).toBeDefined();
        expect(res.body.data.user.id).toBe('1');
      });
  });
});
```

### Test Coverage

- Aim for 80%+ test coverage
- Include coverage report in CI pipeline
- Test critical paths thoroughly

## Error Handling

### GraphQL Error Handling

- Implement custom error handling for GraphQL
- Transform exceptions into GraphQL errors
- Use error extensions for additional metadata
- Log errors appropriately
- Hide sensitive information in production

```typescript
@Catch()
export class GraphQLErrorFilter implements GqlExceptionFilter {
  constructor(private logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const context = gqlHost.getContext();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = (exceptionResponse as any).message || exception.message;
      code = (exceptionResponse as any).error || 'HTTP_EXCEPTION';
    }

    this.logger.error(
      `GraphQL error - ${status}: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    return new GraphQLError(message, {
      extensions: {
        code,
        status,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
```

### Custom Exceptions

- Create domain-specific exceptions
- Extend NestJS HttpException
- Include meaningful error messages and codes

```typescript
export class UserNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`User with ID "${id}" not found`);
  }
}
```

## Response Handling

### GraphQL Response Format

- Use standard GraphQL response format
- Implement proper error handling
- Include metadata for pagination using connections pattern

```typescript
@ObjectType()
export class PageInfo {
  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;

  @Field({ nullable: true })
  startCursor?: string;

  @Field({ nullable: true })
  endCursor?: string;
}

@ObjectType()
export class UserEdge {
  @Field()
  cursor: string;

  @Field(() => User)
  node: User;
}

@ObjectType()
export class UserConnection {
  @Field(() => [UserEdge])
  edges: UserEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;

  @Field()
  totalCount: number;
}
```

### Pagination

- Implement cursor-based pagination using the Relay connection spec
- Return metadata with results
- Support filtering and sorting

```typescript
@Query(() => UserConnection)
async users(
  @Args('first', { nullable: true }) first: number,
  @Args('after', { nullable: true }) after: string,
  @Args('filter', { nullable: true }) filter: UserFilterInput,
): Promise<UserConnection> {
  return this.userService.findAll({ first, after, filter });
}
```

## Dependency Management

### Package Management

- Use npm consistently
- Lock dependencies with package-lock.json
- Update dependencies regularly
- Monitor for security vulnerabilities

### Dependency Injection

- Use NestJS dependency injection
- Use constructor-based injection
- Implement interfaces for testability

```typescript
@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  // Service methods
}
```

## Logging

### Logging Strategy

- Implement structured logging
- Use Winston for logging
- Include request context in logs
- Define different log levels for different environments

```typescript
@Injectable()
export class LoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor(private configService: ConfigService) {
    this.logger = winston.createLogger({
      level: configService.get('LOG_LEVEL') || 'info',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      transports: [
        new winston.transports.Console(),
        // Add file transports for production
      ],
    });
  }

  // Logger methods
}
```

### Log Format

```typescript
{
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  metadata: {
    userId?: string;
    operation?: string;
    ip?: string;
    userAgent?: string;
    traceId?: string;
  }
}
```

## Performance

### Caching

- Implement caching for frequently accessed data
- Use DataLoader for batching and caching
- Consider implementing Apollo Cache

```typescript
@Injectable()
export class UserDataLoader {
  constructor(private userService: UserService) {}

  public readonly batchUsers = new DataLoader<string, User>(
    async (keys: string[]) => {
      const users = await this.userService.findByIds(keys);
      const usersMap = new Map(users.map(user => [user.id, user]));
      return keys.map(key => usersMap.get(key));
    }
  );
}

@Resolver(() => Post)
export class PostResolver {
  constructor(private userDataLoader: UserDataLoader) {}

  @ResolveField(() => User)
  async author(@Parent() post: Post): Promise<User> {
    return this.userDataLoader.batchUsers.load(post.authorId);
  }
}
```

### Query Optimization

- Use database indexes effectively
- Optimize Prisma queries
- Implement pagination for large result sets
- Use projection to select only needed fields
- Implement query complexity analysis
- Consider query depth limiting

```typescript
// In app module or GraphQL module
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  validationRules: [
    depthLimit(10), // Limit query depth
    createComplexityRule({
      maximumComplexity: 50,
      variables: {},
      onComplete: (complexity) => {
        console.log('Query complexity:', complexity);
      },
    }),
  ],
}),
```

## Documentation

### Project Documentation

- Maintain a comprehensive README.md
- Document setup instructions
- Include development workflow
- Describe project structure
- List available scripts
- Include GraphQL schema documentation

### GraphQL Documentation

- Keep GraphQL schema descriptions up-to-date
- Include examples of common queries and mutations
- Document authentication requirements
- Use GraphQL Playground or GraphiQL in development
- Consider generating static documentation from schema

```typescript
// In GraphQL module configuration
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  playground: process.env.NODE_ENV !== 'production',
  introspection: process.env.NODE_ENV !== 'production',
}),
```
