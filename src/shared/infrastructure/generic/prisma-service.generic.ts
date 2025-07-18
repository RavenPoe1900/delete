import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginatedResponse } from '../../applications/dtos/paginationResponse.dto';

/* ---------- utilidades de tipos ---------- */
type Prop<T, K extends PropertyKey, Fallback = never> = K extends keyof T
  ? T[K]
  : Fallback;

type WhereArg<T> = Prop<T, 'where', Record<string, any>>; // ⬅️  ahora siempre es objeto
type OrderByArg<T> = Prop<T, 'orderBy', unknown>;
type SelectArg<T> = Prop<T, 'select', unknown>;
type IncludeArg<T> = Prop<T, 'include', unknown>;

type CountArgs<TFindManyArgs> = { where?: WhereArg<TFindManyArgs> };

type PrismaCrudDelegate<
  TEntity,
  TCreateArgs extends object,
  TFindManyArgs extends object,
  TFindUniqueArgs extends object,
  TUpdateArgs extends object,
  TDeleteArgs extends object,
> = {
  create(args: TCreateArgs): Promise<TEntity>;
  count(args?: CountArgs<TFindManyArgs>): Promise<number>;
  findMany(args: TFindManyArgs): Promise<TEntity[]>;
  findUnique(args: TFindUniqueArgs): Promise<TEntity | null>;
  update(args: TUpdateArgs): Promise<TEntity>;
  delete(args: TDeleteArgs): Promise<TEntity>;
  $transaction?: <A extends Promise<unknown>[]>(
    ops: [...A],
  ) => Promise<{ [K in keyof A]: Awaited<A[K]> }>;
};

type DictSection = {
  unique?: Record<string, string>;
  foreignKey?: Record<string, string>;
  [key: string]: any;
};

interface ServiceOptions {
  modelName?: string;
  errorDictionary?: Record<string, DictSection>;
}

@Injectable()
export class PrismaGenericService<
  TEntity,
  TCreateArgs extends object,
  TFindManyArgs extends { take?: number; skip?: number },
  TFindUniqueArgs extends { where: object },
  TUpdateArgs extends { where: object; data: object },
  TDeleteArgs extends { where: object },
> {
  private static readonly DEFAULT_DICTIONARY: Record<string, DictSection> = {
    default: {
      unique: { default: 'Unique constraint failed.' },
      foreignKey: { default: 'Foreign key constraint failed.' },
    },
  };

  private readonly errorDictionary: Record<string, DictSection>;
  private readonly modelName: string;

  constructor(
    private readonly model: PrismaCrudDelegate<
      TEntity,
      TCreateArgs,
      TFindManyArgs,
      TFindUniqueArgs,
      TUpdateArgs,
      TDeleteArgs
    >,
    opts: ServiceOptions = {},
  ) {
    this.modelName = opts.modelName ?? 'default';
    this.errorDictionary = {
      ...PrismaGenericService.DEFAULT_DICTIONARY,
      ...(opts.errorDictionary ?? {}),
    };
  }

  /* ─────────────── CREATE ─────────────── */
  async create(args: TCreateArgs): Promise<TEntity> {
    try {
      return await this.model.create(args);
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  /* ─────────────── COUNT ─────────────── */
  async count(filter: CountArgs<TFindManyArgs> = {}): Promise<number> {
    try {
      return await this.model.count(filter);
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  /* ────────── FIND ALL (paginación) ────────── */
  async findAll(
    params: TFindManyArgs & {
      page?: number;
      perPage?: number;
      filter?: WhereArg<TFindManyArgs>;
    },
  ): Promise<PaginatedResponse<TEntity>> {
    const { page, perPage, filter, ...baseArgs } = params;

    /* Derivamos skip/take */
    const take = perPage ?? (baseArgs as any).take ?? 10;
    const skip =
      page !== undefined ? (page - 1) * take : ((baseArgs as any).skip ?? 0);

    /* Fusionamos filtros en un objeto seguro */
    const whereMerged: WhereArg<TFindManyArgs> | undefined = filter
      ? {
          ...(baseArgs as any).where,
          ...(filter as Record<string, any>),
        }
      : (baseArgs as any).where;

    /* Construimos argumentos definitivos */
    const findArgs = {
      ...baseArgs,
      skip,
      take,
      ...(whereMerged ? { where: whereMerged } : {}),
    } as unknown as TFindManyArgs;

    const countArgs: CountArgs<TFindManyArgs> = whereMerged
      ? { where: whereMerged }
      : {};

    try {
      const [totalResults, data] = this.model.$transaction
        ? await this.model.$transaction([
            this.model.count(countArgs),
            this.model.findMany(findArgs),
          ])
        : await Promise.all([
            this.model.count(countArgs),
            this.model.findMany(findArgs),
          ]);

      const totalPages = Math.max(1, Math.ceil(totalResults / take));
      const currentPage = page ?? Math.floor(skip / take) + 1;

      return { data, pageInfo: { currentPage, totalPages, totalResults } };
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  /* ────────── FIND ALL cursor ────────── */
  async findAllCursor(args: {
    cursor?: number | string;
    take?: number;
    where?: WhereArg<TFindManyArgs>;
    orderBy?: OrderByArg<TFindManyArgs>;
    select?: SelectArg<TFindManyArgs>;
    include?: IncludeArg<TFindManyArgs>;
  }): Promise<PaginatedResponse<TEntity>> {
    const { cursor, take = 20, ...rest } = args;

    const findArgs = {
      ...rest,
      take,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
    } as unknown as TFindManyArgs;

    try {
      const data = await this.model.findMany(findArgs);
      return {
        data,
        pageInfo: {
          currentPage: 1,
          totalPages: 1,
          totalResults: data.length,
        },
      };
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  /* ─────────────── FIND ONE ─────────────── */
  async findOne(args: TFindUniqueArgs): Promise<TEntity> {
    const item = await this.model
      .findUnique(args)
      .catch((e) => this.handlePrismaError(e));
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  /* ─────────────── UPDATE ─────────────── */
  async update(
    findArgs: TFindUniqueArgs,
    updateArgs: TUpdateArgs,
  ): Promise<TEntity> {
    try {
      return await this.model.update({
        ...updateArgs,
        where: findArgs.where,
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      )
        throw new NotFoundException('Item not found');
      this.handlePrismaError(e);
    }
  }

  /* ─────────────── DELETE ─────────────── */
  async remove(
    findArgs: TFindUniqueArgs,
    deleteArgs: TDeleteArgs,
  ): Promise<TEntity> {
    try {
      return await this.model.delete({
        ...deleteArgs,
        where: findArgs.where,
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      )
        throw new NotFoundException('Item not found');
      this.handlePrismaError(e);
    }
  }

  /* ─────────── manejo de errores ─────────── */
  private handlePrismaError(e: unknown): never {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      const code = e.code;
      const uniqueField = Array.isArray(e.meta?.target)
        ? e.meta.target[0]
        : (e.meta?.target as string | undefined);
      const foreignField = e.meta?.field_name as string | undefined;

      const dict =
        this.errorDictionary[this.modelName] ?? this.errorDictionary.default;

      const message =
        code === 'P2002'
          ? (dict.unique?.[uniqueField ?? ''] ??
            this.errorDictionary.default.unique!.default)
          : code === 'P2003'
            ? (dict.foreignKey?.[foreignField ?? ''] ??
              this.errorDictionary.default.foreignKey!.default)
            : 'Database error';

      const status = ['P2002', 'P2003', 'P2004', 'P2025'].includes(code)
        ? 400
        : 500;

      throw new HttpException({ statusCode: status, message }, status);
    }

    if (e instanceof HttpException) throw e;

    throw new HttpException(
      {
        statusCode: 500,
        message:
          'Server Error: an unexpected error occurred processing the request',
      },
      500,
    );
  }
}
