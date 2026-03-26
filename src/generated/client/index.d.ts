
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model AdminUser
 * 
 */
export type AdminUser = $Result.DefaultSelection<Prisma.$AdminUserPayload>
/**
 * Model Cart
 * 
 */
export type Cart = $Result.DefaultSelection<Prisma.$CartPayload>
/**
 * Model CachedCategory
 * 
 */
export type CachedCategory = $Result.DefaultSelection<Prisma.$CachedCategoryPayload>
/**
 * Model CachedProduct
 * 
 */
export type CachedProduct = $Result.DefaultSelection<Prisma.$CachedProductPayload>
/**
 * Model Payment
 * 
 */
export type Payment = $Result.DefaultSelection<Prisma.$PaymentPayload>
/**
 * Model Retailer
 * 
 */
export type Retailer = $Result.DefaultSelection<Prisma.$RetailerPayload>
/**
 * Model PlatformKey
 * 
 */
export type PlatformKey = $Result.DefaultSelection<Prisma.$PlatformKeyPayload>
/**
 * Model AuditLog
 * 
 */
export type AuditLog = $Result.DefaultSelection<Prisma.$AuditLogPayload>
/**
 * Model Setting
 * 
 */
export type Setting = $Result.DefaultSelection<Prisma.$SettingPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more AdminUsers
 * const adminUsers = await prisma.adminUser.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more AdminUsers
   * const adminUsers = await prisma.adminUser.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.adminUser`: Exposes CRUD operations for the **AdminUser** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AdminUsers
    * const adminUsers = await prisma.adminUser.findMany()
    * ```
    */
  get adminUser(): Prisma.AdminUserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.cart`: Exposes CRUD operations for the **Cart** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Carts
    * const carts = await prisma.cart.findMany()
    * ```
    */
  get cart(): Prisma.CartDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.cachedCategory`: Exposes CRUD operations for the **CachedCategory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CachedCategories
    * const cachedCategories = await prisma.cachedCategory.findMany()
    * ```
    */
  get cachedCategory(): Prisma.CachedCategoryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.cachedProduct`: Exposes CRUD operations for the **CachedProduct** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CachedProducts
    * const cachedProducts = await prisma.cachedProduct.findMany()
    * ```
    */
  get cachedProduct(): Prisma.CachedProductDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.payment`: Exposes CRUD operations for the **Payment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Payments
    * const payments = await prisma.payment.findMany()
    * ```
    */
  get payment(): Prisma.PaymentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.retailer`: Exposes CRUD operations for the **Retailer** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Retailers
    * const retailers = await prisma.retailer.findMany()
    * ```
    */
  get retailer(): Prisma.RetailerDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.platformKey`: Exposes CRUD operations for the **PlatformKey** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PlatformKeys
    * const platformKeys = await prisma.platformKey.findMany()
    * ```
    */
  get platformKey(): Prisma.PlatformKeyDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.auditLog`: Exposes CRUD operations for the **AuditLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AuditLogs
    * const auditLogs = await prisma.auditLog.findMany()
    * ```
    */
  get auditLog(): Prisma.AuditLogDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.setting`: Exposes CRUD operations for the **Setting** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Settings
    * const settings = await prisma.setting.findMany()
    * ```
    */
  get setting(): Prisma.SettingDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.5.0
   * Query Engine version: 280c870be64f457428992c43c1f6d557fab6e29e
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    AdminUser: 'AdminUser',
    Cart: 'Cart',
    CachedCategory: 'CachedCategory',
    CachedProduct: 'CachedProduct',
    Payment: 'Payment',
    Retailer: 'Retailer',
    PlatformKey: 'PlatformKey',
    AuditLog: 'AuditLog',
    Setting: 'Setting'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "adminUser" | "cart" | "cachedCategory" | "cachedProduct" | "payment" | "retailer" | "platformKey" | "auditLog" | "setting"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      AdminUser: {
        payload: Prisma.$AdminUserPayload<ExtArgs>
        fields: Prisma.AdminUserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AdminUserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminUserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AdminUserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminUserPayload>
          }
          findFirst: {
            args: Prisma.AdminUserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminUserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AdminUserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminUserPayload>
          }
          findMany: {
            args: Prisma.AdminUserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminUserPayload>[]
          }
          create: {
            args: Prisma.AdminUserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminUserPayload>
          }
          createMany: {
            args: Prisma.AdminUserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AdminUserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminUserPayload>[]
          }
          delete: {
            args: Prisma.AdminUserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminUserPayload>
          }
          update: {
            args: Prisma.AdminUserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminUserPayload>
          }
          deleteMany: {
            args: Prisma.AdminUserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AdminUserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AdminUserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminUserPayload>[]
          }
          upsert: {
            args: Prisma.AdminUserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminUserPayload>
          }
          aggregate: {
            args: Prisma.AdminUserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAdminUser>
          }
          groupBy: {
            args: Prisma.AdminUserGroupByArgs<ExtArgs>
            result: $Utils.Optional<AdminUserGroupByOutputType>[]
          }
          count: {
            args: Prisma.AdminUserCountArgs<ExtArgs>
            result: $Utils.Optional<AdminUserCountAggregateOutputType> | number
          }
        }
      }
      Cart: {
        payload: Prisma.$CartPayload<ExtArgs>
        fields: Prisma.CartFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CartFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CartPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CartFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CartPayload>
          }
          findFirst: {
            args: Prisma.CartFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CartPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CartFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CartPayload>
          }
          findMany: {
            args: Prisma.CartFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CartPayload>[]
          }
          create: {
            args: Prisma.CartCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CartPayload>
          }
          createMany: {
            args: Prisma.CartCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CartCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CartPayload>[]
          }
          delete: {
            args: Prisma.CartDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CartPayload>
          }
          update: {
            args: Prisma.CartUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CartPayload>
          }
          deleteMany: {
            args: Prisma.CartDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CartUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CartUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CartPayload>[]
          }
          upsert: {
            args: Prisma.CartUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CartPayload>
          }
          aggregate: {
            args: Prisma.CartAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCart>
          }
          groupBy: {
            args: Prisma.CartGroupByArgs<ExtArgs>
            result: $Utils.Optional<CartGroupByOutputType>[]
          }
          count: {
            args: Prisma.CartCountArgs<ExtArgs>
            result: $Utils.Optional<CartCountAggregateOutputType> | number
          }
        }
      }
      CachedCategory: {
        payload: Prisma.$CachedCategoryPayload<ExtArgs>
        fields: Prisma.CachedCategoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CachedCategoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedCategoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CachedCategoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedCategoryPayload>
          }
          findFirst: {
            args: Prisma.CachedCategoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedCategoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CachedCategoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedCategoryPayload>
          }
          findMany: {
            args: Prisma.CachedCategoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedCategoryPayload>[]
          }
          create: {
            args: Prisma.CachedCategoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedCategoryPayload>
          }
          createMany: {
            args: Prisma.CachedCategoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CachedCategoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedCategoryPayload>[]
          }
          delete: {
            args: Prisma.CachedCategoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedCategoryPayload>
          }
          update: {
            args: Prisma.CachedCategoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedCategoryPayload>
          }
          deleteMany: {
            args: Prisma.CachedCategoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CachedCategoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CachedCategoryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedCategoryPayload>[]
          }
          upsert: {
            args: Prisma.CachedCategoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedCategoryPayload>
          }
          aggregate: {
            args: Prisma.CachedCategoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCachedCategory>
          }
          groupBy: {
            args: Prisma.CachedCategoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<CachedCategoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.CachedCategoryCountArgs<ExtArgs>
            result: $Utils.Optional<CachedCategoryCountAggregateOutputType> | number
          }
        }
      }
      CachedProduct: {
        payload: Prisma.$CachedProductPayload<ExtArgs>
        fields: Prisma.CachedProductFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CachedProductFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedProductPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CachedProductFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedProductPayload>
          }
          findFirst: {
            args: Prisma.CachedProductFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedProductPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CachedProductFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedProductPayload>
          }
          findMany: {
            args: Prisma.CachedProductFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedProductPayload>[]
          }
          create: {
            args: Prisma.CachedProductCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedProductPayload>
          }
          createMany: {
            args: Prisma.CachedProductCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CachedProductCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedProductPayload>[]
          }
          delete: {
            args: Prisma.CachedProductDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedProductPayload>
          }
          update: {
            args: Prisma.CachedProductUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedProductPayload>
          }
          deleteMany: {
            args: Prisma.CachedProductDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CachedProductUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CachedProductUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedProductPayload>[]
          }
          upsert: {
            args: Prisma.CachedProductUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CachedProductPayload>
          }
          aggregate: {
            args: Prisma.CachedProductAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCachedProduct>
          }
          groupBy: {
            args: Prisma.CachedProductGroupByArgs<ExtArgs>
            result: $Utils.Optional<CachedProductGroupByOutputType>[]
          }
          count: {
            args: Prisma.CachedProductCountArgs<ExtArgs>
            result: $Utils.Optional<CachedProductCountAggregateOutputType> | number
          }
        }
      }
      Payment: {
        payload: Prisma.$PaymentPayload<ExtArgs>
        fields: Prisma.PaymentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PaymentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PaymentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>
          }
          findFirst: {
            args: Prisma.PaymentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PaymentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>
          }
          findMany: {
            args: Prisma.PaymentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>[]
          }
          create: {
            args: Prisma.PaymentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>
          }
          createMany: {
            args: Prisma.PaymentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PaymentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>[]
          }
          delete: {
            args: Prisma.PaymentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>
          }
          update: {
            args: Prisma.PaymentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>
          }
          deleteMany: {
            args: Prisma.PaymentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PaymentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PaymentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>[]
          }
          upsert: {
            args: Prisma.PaymentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaymentPayload>
          }
          aggregate: {
            args: Prisma.PaymentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePayment>
          }
          groupBy: {
            args: Prisma.PaymentGroupByArgs<ExtArgs>
            result: $Utils.Optional<PaymentGroupByOutputType>[]
          }
          count: {
            args: Prisma.PaymentCountArgs<ExtArgs>
            result: $Utils.Optional<PaymentCountAggregateOutputType> | number
          }
        }
      }
      Retailer: {
        payload: Prisma.$RetailerPayload<ExtArgs>
        fields: Prisma.RetailerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RetailerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RetailerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RetailerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RetailerPayload>
          }
          findFirst: {
            args: Prisma.RetailerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RetailerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RetailerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RetailerPayload>
          }
          findMany: {
            args: Prisma.RetailerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RetailerPayload>[]
          }
          create: {
            args: Prisma.RetailerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RetailerPayload>
          }
          createMany: {
            args: Prisma.RetailerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RetailerCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RetailerPayload>[]
          }
          delete: {
            args: Prisma.RetailerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RetailerPayload>
          }
          update: {
            args: Prisma.RetailerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RetailerPayload>
          }
          deleteMany: {
            args: Prisma.RetailerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RetailerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RetailerUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RetailerPayload>[]
          }
          upsert: {
            args: Prisma.RetailerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RetailerPayload>
          }
          aggregate: {
            args: Prisma.RetailerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRetailer>
          }
          groupBy: {
            args: Prisma.RetailerGroupByArgs<ExtArgs>
            result: $Utils.Optional<RetailerGroupByOutputType>[]
          }
          count: {
            args: Prisma.RetailerCountArgs<ExtArgs>
            result: $Utils.Optional<RetailerCountAggregateOutputType> | number
          }
        }
      }
      PlatformKey: {
        payload: Prisma.$PlatformKeyPayload<ExtArgs>
        fields: Prisma.PlatformKeyFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PlatformKeyFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformKeyPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PlatformKeyFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformKeyPayload>
          }
          findFirst: {
            args: Prisma.PlatformKeyFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformKeyPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PlatformKeyFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformKeyPayload>
          }
          findMany: {
            args: Prisma.PlatformKeyFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformKeyPayload>[]
          }
          create: {
            args: Prisma.PlatformKeyCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformKeyPayload>
          }
          createMany: {
            args: Prisma.PlatformKeyCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PlatformKeyCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformKeyPayload>[]
          }
          delete: {
            args: Prisma.PlatformKeyDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformKeyPayload>
          }
          update: {
            args: Prisma.PlatformKeyUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformKeyPayload>
          }
          deleteMany: {
            args: Prisma.PlatformKeyDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PlatformKeyUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PlatformKeyUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformKeyPayload>[]
          }
          upsert: {
            args: Prisma.PlatformKeyUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformKeyPayload>
          }
          aggregate: {
            args: Prisma.PlatformKeyAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePlatformKey>
          }
          groupBy: {
            args: Prisma.PlatformKeyGroupByArgs<ExtArgs>
            result: $Utils.Optional<PlatformKeyGroupByOutputType>[]
          }
          count: {
            args: Prisma.PlatformKeyCountArgs<ExtArgs>
            result: $Utils.Optional<PlatformKeyCountAggregateOutputType> | number
          }
        }
      }
      AuditLog: {
        payload: Prisma.$AuditLogPayload<ExtArgs>
        fields: Prisma.AuditLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AuditLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AuditLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          findFirst: {
            args: Prisma.AuditLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AuditLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          findMany: {
            args: Prisma.AuditLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[]
          }
          create: {
            args: Prisma.AuditLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          createMany: {
            args: Prisma.AuditLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AuditLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[]
          }
          delete: {
            args: Prisma.AuditLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          update: {
            args: Prisma.AuditLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          deleteMany: {
            args: Prisma.AuditLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AuditLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AuditLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[]
          }
          upsert: {
            args: Prisma.AuditLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          aggregate: {
            args: Prisma.AuditLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAuditLog>
          }
          groupBy: {
            args: Prisma.AuditLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<AuditLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.AuditLogCountArgs<ExtArgs>
            result: $Utils.Optional<AuditLogCountAggregateOutputType> | number
          }
        }
      }
      Setting: {
        payload: Prisma.$SettingPayload<ExtArgs>
        fields: Prisma.SettingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SettingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SettingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingPayload>
          }
          findFirst: {
            args: Prisma.SettingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SettingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingPayload>
          }
          findMany: {
            args: Prisma.SettingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingPayload>[]
          }
          create: {
            args: Prisma.SettingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingPayload>
          }
          createMany: {
            args: Prisma.SettingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SettingCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingPayload>[]
          }
          delete: {
            args: Prisma.SettingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingPayload>
          }
          update: {
            args: Prisma.SettingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingPayload>
          }
          deleteMany: {
            args: Prisma.SettingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SettingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SettingUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingPayload>[]
          }
          upsert: {
            args: Prisma.SettingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingPayload>
          }
          aggregate: {
            args: Prisma.SettingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSetting>
          }
          groupBy: {
            args: Prisma.SettingGroupByArgs<ExtArgs>
            result: $Utils.Optional<SettingGroupByOutputType>[]
          }
          count: {
            args: Prisma.SettingCountArgs<ExtArgs>
            result: $Utils.Optional<SettingCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    adminUser?: AdminUserOmit
    cart?: CartOmit
    cachedCategory?: CachedCategoryOmit
    cachedProduct?: CachedProductOmit
    payment?: PaymentOmit
    retailer?: RetailerOmit
    platformKey?: PlatformKeyOmit
    auditLog?: AuditLogOmit
    setting?: SettingOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type RetailerCountOutputType
   */

  export type RetailerCountOutputType = {
    auditLogs: number
  }

  export type RetailerCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    auditLogs?: boolean | RetailerCountOutputTypeCountAuditLogsArgs
  }

  // Custom InputTypes
  /**
   * RetailerCountOutputType without action
   */
  export type RetailerCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RetailerCountOutputType
     */
    select?: RetailerCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * RetailerCountOutputType without action
   */
  export type RetailerCountOutputTypeCountAuditLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuditLogWhereInput
  }


  /**
   * Models
   */

  /**
   * Model AdminUser
   */

  export type AggregateAdminUser = {
    _count: AdminUserCountAggregateOutputType | null
    _avg: AdminUserAvgAggregateOutputType | null
    _sum: AdminUserSumAggregateOutputType | null
    _min: AdminUserMinAggregateOutputType | null
    _max: AdminUserMaxAggregateOutputType | null
  }

  export type AdminUserAvgAggregateOutputType = {
    id: number | null
  }

  export type AdminUserSumAggregateOutputType = {
    id: number | null
  }

  export type AdminUserMinAggregateOutputType = {
    id: number | null
    username: string | null
    passwordHash: string | null
    createdAt: Date | null
  }

  export type AdminUserMaxAggregateOutputType = {
    id: number | null
    username: string | null
    passwordHash: string | null
    createdAt: Date | null
  }

  export type AdminUserCountAggregateOutputType = {
    id: number
    username: number
    passwordHash: number
    createdAt: number
    _all: number
  }


  export type AdminUserAvgAggregateInputType = {
    id?: true
  }

  export type AdminUserSumAggregateInputType = {
    id?: true
  }

  export type AdminUserMinAggregateInputType = {
    id?: true
    username?: true
    passwordHash?: true
    createdAt?: true
  }

  export type AdminUserMaxAggregateInputType = {
    id?: true
    username?: true
    passwordHash?: true
    createdAt?: true
  }

  export type AdminUserCountAggregateInputType = {
    id?: true
    username?: true
    passwordHash?: true
    createdAt?: true
    _all?: true
  }

  export type AdminUserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AdminUser to aggregate.
     */
    where?: AdminUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdminUsers to fetch.
     */
    orderBy?: AdminUserOrderByWithRelationInput | AdminUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AdminUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdminUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdminUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AdminUsers
    **/
    _count?: true | AdminUserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AdminUserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AdminUserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AdminUserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AdminUserMaxAggregateInputType
  }

  export type GetAdminUserAggregateType<T extends AdminUserAggregateArgs> = {
        [P in keyof T & keyof AggregateAdminUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAdminUser[P]>
      : GetScalarType<T[P], AggregateAdminUser[P]>
  }




  export type AdminUserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AdminUserWhereInput
    orderBy?: AdminUserOrderByWithAggregationInput | AdminUserOrderByWithAggregationInput[]
    by: AdminUserScalarFieldEnum[] | AdminUserScalarFieldEnum
    having?: AdminUserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AdminUserCountAggregateInputType | true
    _avg?: AdminUserAvgAggregateInputType
    _sum?: AdminUserSumAggregateInputType
    _min?: AdminUserMinAggregateInputType
    _max?: AdminUserMaxAggregateInputType
  }

  export type AdminUserGroupByOutputType = {
    id: number
    username: string
    passwordHash: string
    createdAt: Date
    _count: AdminUserCountAggregateOutputType | null
    _avg: AdminUserAvgAggregateOutputType | null
    _sum: AdminUserSumAggregateOutputType | null
    _min: AdminUserMinAggregateOutputType | null
    _max: AdminUserMaxAggregateOutputType | null
  }

  type GetAdminUserGroupByPayload<T extends AdminUserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AdminUserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AdminUserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AdminUserGroupByOutputType[P]>
            : GetScalarType<T[P], AdminUserGroupByOutputType[P]>
        }
      >
    >


  export type AdminUserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    passwordHash?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["adminUser"]>

  export type AdminUserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    passwordHash?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["adminUser"]>

  export type AdminUserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    passwordHash?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["adminUser"]>

  export type AdminUserSelectScalar = {
    id?: boolean
    username?: boolean
    passwordHash?: boolean
    createdAt?: boolean
  }

  export type AdminUserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "username" | "passwordHash" | "createdAt", ExtArgs["result"]["adminUser"]>

  export type $AdminUserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AdminUser"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      username: string
      passwordHash: string
      createdAt: Date
    }, ExtArgs["result"]["adminUser"]>
    composites: {}
  }

  type AdminUserGetPayload<S extends boolean | null | undefined | AdminUserDefaultArgs> = $Result.GetResult<Prisma.$AdminUserPayload, S>

  type AdminUserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AdminUserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AdminUserCountAggregateInputType | true
    }

  export interface AdminUserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AdminUser'], meta: { name: 'AdminUser' } }
    /**
     * Find zero or one AdminUser that matches the filter.
     * @param {AdminUserFindUniqueArgs} args - Arguments to find a AdminUser
     * @example
     * // Get one AdminUser
     * const adminUser = await prisma.adminUser.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AdminUserFindUniqueArgs>(args: SelectSubset<T, AdminUserFindUniqueArgs<ExtArgs>>): Prisma__AdminUserClient<$Result.GetResult<Prisma.$AdminUserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AdminUser that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AdminUserFindUniqueOrThrowArgs} args - Arguments to find a AdminUser
     * @example
     * // Get one AdminUser
     * const adminUser = await prisma.adminUser.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AdminUserFindUniqueOrThrowArgs>(args: SelectSubset<T, AdminUserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AdminUserClient<$Result.GetResult<Prisma.$AdminUserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AdminUser that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminUserFindFirstArgs} args - Arguments to find a AdminUser
     * @example
     * // Get one AdminUser
     * const adminUser = await prisma.adminUser.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AdminUserFindFirstArgs>(args?: SelectSubset<T, AdminUserFindFirstArgs<ExtArgs>>): Prisma__AdminUserClient<$Result.GetResult<Prisma.$AdminUserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AdminUser that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminUserFindFirstOrThrowArgs} args - Arguments to find a AdminUser
     * @example
     * // Get one AdminUser
     * const adminUser = await prisma.adminUser.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AdminUserFindFirstOrThrowArgs>(args?: SelectSubset<T, AdminUserFindFirstOrThrowArgs<ExtArgs>>): Prisma__AdminUserClient<$Result.GetResult<Prisma.$AdminUserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AdminUsers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminUserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AdminUsers
     * const adminUsers = await prisma.adminUser.findMany()
     * 
     * // Get first 10 AdminUsers
     * const adminUsers = await prisma.adminUser.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const adminUserWithIdOnly = await prisma.adminUser.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AdminUserFindManyArgs>(args?: SelectSubset<T, AdminUserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AdminUserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AdminUser.
     * @param {AdminUserCreateArgs} args - Arguments to create a AdminUser.
     * @example
     * // Create one AdminUser
     * const AdminUser = await prisma.adminUser.create({
     *   data: {
     *     // ... data to create a AdminUser
     *   }
     * })
     * 
     */
    create<T extends AdminUserCreateArgs>(args: SelectSubset<T, AdminUserCreateArgs<ExtArgs>>): Prisma__AdminUserClient<$Result.GetResult<Prisma.$AdminUserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AdminUsers.
     * @param {AdminUserCreateManyArgs} args - Arguments to create many AdminUsers.
     * @example
     * // Create many AdminUsers
     * const adminUser = await prisma.adminUser.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AdminUserCreateManyArgs>(args?: SelectSubset<T, AdminUserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AdminUsers and returns the data saved in the database.
     * @param {AdminUserCreateManyAndReturnArgs} args - Arguments to create many AdminUsers.
     * @example
     * // Create many AdminUsers
     * const adminUser = await prisma.adminUser.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AdminUsers and only return the `id`
     * const adminUserWithIdOnly = await prisma.adminUser.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AdminUserCreateManyAndReturnArgs>(args?: SelectSubset<T, AdminUserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AdminUserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AdminUser.
     * @param {AdminUserDeleteArgs} args - Arguments to delete one AdminUser.
     * @example
     * // Delete one AdminUser
     * const AdminUser = await prisma.adminUser.delete({
     *   where: {
     *     // ... filter to delete one AdminUser
     *   }
     * })
     * 
     */
    delete<T extends AdminUserDeleteArgs>(args: SelectSubset<T, AdminUserDeleteArgs<ExtArgs>>): Prisma__AdminUserClient<$Result.GetResult<Prisma.$AdminUserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AdminUser.
     * @param {AdminUserUpdateArgs} args - Arguments to update one AdminUser.
     * @example
     * // Update one AdminUser
     * const adminUser = await prisma.adminUser.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AdminUserUpdateArgs>(args: SelectSubset<T, AdminUserUpdateArgs<ExtArgs>>): Prisma__AdminUserClient<$Result.GetResult<Prisma.$AdminUserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AdminUsers.
     * @param {AdminUserDeleteManyArgs} args - Arguments to filter AdminUsers to delete.
     * @example
     * // Delete a few AdminUsers
     * const { count } = await prisma.adminUser.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AdminUserDeleteManyArgs>(args?: SelectSubset<T, AdminUserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AdminUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminUserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AdminUsers
     * const adminUser = await prisma.adminUser.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AdminUserUpdateManyArgs>(args: SelectSubset<T, AdminUserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AdminUsers and returns the data updated in the database.
     * @param {AdminUserUpdateManyAndReturnArgs} args - Arguments to update many AdminUsers.
     * @example
     * // Update many AdminUsers
     * const adminUser = await prisma.adminUser.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AdminUsers and only return the `id`
     * const adminUserWithIdOnly = await prisma.adminUser.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AdminUserUpdateManyAndReturnArgs>(args: SelectSubset<T, AdminUserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AdminUserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AdminUser.
     * @param {AdminUserUpsertArgs} args - Arguments to update or create a AdminUser.
     * @example
     * // Update or create a AdminUser
     * const adminUser = await prisma.adminUser.upsert({
     *   create: {
     *     // ... data to create a AdminUser
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AdminUser we want to update
     *   }
     * })
     */
    upsert<T extends AdminUserUpsertArgs>(args: SelectSubset<T, AdminUserUpsertArgs<ExtArgs>>): Prisma__AdminUserClient<$Result.GetResult<Prisma.$AdminUserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AdminUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminUserCountArgs} args - Arguments to filter AdminUsers to count.
     * @example
     * // Count the number of AdminUsers
     * const count = await prisma.adminUser.count({
     *   where: {
     *     // ... the filter for the AdminUsers we want to count
     *   }
     * })
    **/
    count<T extends AdminUserCountArgs>(
      args?: Subset<T, AdminUserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AdminUserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AdminUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminUserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AdminUserAggregateArgs>(args: Subset<T, AdminUserAggregateArgs>): Prisma.PrismaPromise<GetAdminUserAggregateType<T>>

    /**
     * Group by AdminUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminUserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AdminUserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AdminUserGroupByArgs['orderBy'] }
        : { orderBy?: AdminUserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AdminUserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAdminUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AdminUser model
   */
  readonly fields: AdminUserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AdminUser.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AdminUserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AdminUser model
   */
  interface AdminUserFieldRefs {
    readonly id: FieldRef<"AdminUser", 'Int'>
    readonly username: FieldRef<"AdminUser", 'String'>
    readonly passwordHash: FieldRef<"AdminUser", 'String'>
    readonly createdAt: FieldRef<"AdminUser", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AdminUser findUnique
   */
  export type AdminUserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminUser
     */
    select?: AdminUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminUser
     */
    omit?: AdminUserOmit<ExtArgs> | null
    /**
     * Filter, which AdminUser to fetch.
     */
    where: AdminUserWhereUniqueInput
  }

  /**
   * AdminUser findUniqueOrThrow
   */
  export type AdminUserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminUser
     */
    select?: AdminUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminUser
     */
    omit?: AdminUserOmit<ExtArgs> | null
    /**
     * Filter, which AdminUser to fetch.
     */
    where: AdminUserWhereUniqueInput
  }

  /**
   * AdminUser findFirst
   */
  export type AdminUserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminUser
     */
    select?: AdminUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminUser
     */
    omit?: AdminUserOmit<ExtArgs> | null
    /**
     * Filter, which AdminUser to fetch.
     */
    where?: AdminUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdminUsers to fetch.
     */
    orderBy?: AdminUserOrderByWithRelationInput | AdminUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AdminUsers.
     */
    cursor?: AdminUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdminUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdminUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AdminUsers.
     */
    distinct?: AdminUserScalarFieldEnum | AdminUserScalarFieldEnum[]
  }

  /**
   * AdminUser findFirstOrThrow
   */
  export type AdminUserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminUser
     */
    select?: AdminUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminUser
     */
    omit?: AdminUserOmit<ExtArgs> | null
    /**
     * Filter, which AdminUser to fetch.
     */
    where?: AdminUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdminUsers to fetch.
     */
    orderBy?: AdminUserOrderByWithRelationInput | AdminUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AdminUsers.
     */
    cursor?: AdminUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdminUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdminUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AdminUsers.
     */
    distinct?: AdminUserScalarFieldEnum | AdminUserScalarFieldEnum[]
  }

  /**
   * AdminUser findMany
   */
  export type AdminUserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminUser
     */
    select?: AdminUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminUser
     */
    omit?: AdminUserOmit<ExtArgs> | null
    /**
     * Filter, which AdminUsers to fetch.
     */
    where?: AdminUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdminUsers to fetch.
     */
    orderBy?: AdminUserOrderByWithRelationInput | AdminUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AdminUsers.
     */
    cursor?: AdminUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdminUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdminUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AdminUsers.
     */
    distinct?: AdminUserScalarFieldEnum | AdminUserScalarFieldEnum[]
  }

  /**
   * AdminUser create
   */
  export type AdminUserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminUser
     */
    select?: AdminUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminUser
     */
    omit?: AdminUserOmit<ExtArgs> | null
    /**
     * The data needed to create a AdminUser.
     */
    data: XOR<AdminUserCreateInput, AdminUserUncheckedCreateInput>
  }

  /**
   * AdminUser createMany
   */
  export type AdminUserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AdminUsers.
     */
    data: AdminUserCreateManyInput | AdminUserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AdminUser createManyAndReturn
   */
  export type AdminUserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminUser
     */
    select?: AdminUserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AdminUser
     */
    omit?: AdminUserOmit<ExtArgs> | null
    /**
     * The data used to create many AdminUsers.
     */
    data: AdminUserCreateManyInput | AdminUserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AdminUser update
   */
  export type AdminUserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminUser
     */
    select?: AdminUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminUser
     */
    omit?: AdminUserOmit<ExtArgs> | null
    /**
     * The data needed to update a AdminUser.
     */
    data: XOR<AdminUserUpdateInput, AdminUserUncheckedUpdateInput>
    /**
     * Choose, which AdminUser to update.
     */
    where: AdminUserWhereUniqueInput
  }

  /**
   * AdminUser updateMany
   */
  export type AdminUserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AdminUsers.
     */
    data: XOR<AdminUserUpdateManyMutationInput, AdminUserUncheckedUpdateManyInput>
    /**
     * Filter which AdminUsers to update
     */
    where?: AdminUserWhereInput
    /**
     * Limit how many AdminUsers to update.
     */
    limit?: number
  }

  /**
   * AdminUser updateManyAndReturn
   */
  export type AdminUserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminUser
     */
    select?: AdminUserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AdminUser
     */
    omit?: AdminUserOmit<ExtArgs> | null
    /**
     * The data used to update AdminUsers.
     */
    data: XOR<AdminUserUpdateManyMutationInput, AdminUserUncheckedUpdateManyInput>
    /**
     * Filter which AdminUsers to update
     */
    where?: AdminUserWhereInput
    /**
     * Limit how many AdminUsers to update.
     */
    limit?: number
  }

  /**
   * AdminUser upsert
   */
  export type AdminUserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminUser
     */
    select?: AdminUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminUser
     */
    omit?: AdminUserOmit<ExtArgs> | null
    /**
     * The filter to search for the AdminUser to update in case it exists.
     */
    where: AdminUserWhereUniqueInput
    /**
     * In case the AdminUser found by the `where` argument doesn't exist, create a new AdminUser with this data.
     */
    create: XOR<AdminUserCreateInput, AdminUserUncheckedCreateInput>
    /**
     * In case the AdminUser was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AdminUserUpdateInput, AdminUserUncheckedUpdateInput>
  }

  /**
   * AdminUser delete
   */
  export type AdminUserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminUser
     */
    select?: AdminUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminUser
     */
    omit?: AdminUserOmit<ExtArgs> | null
    /**
     * Filter which AdminUser to delete.
     */
    where: AdminUserWhereUniqueInput
  }

  /**
   * AdminUser deleteMany
   */
  export type AdminUserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AdminUsers to delete
     */
    where?: AdminUserWhereInput
    /**
     * Limit how many AdminUsers to delete.
     */
    limit?: number
  }

  /**
   * AdminUser without action
   */
  export type AdminUserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminUser
     */
    select?: AdminUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminUser
     */
    omit?: AdminUserOmit<ExtArgs> | null
  }


  /**
   * Model Cart
   */

  export type AggregateCart = {
    _count: CartCountAggregateOutputType | null
    _avg: CartAvgAggregateOutputType | null
    _sum: CartSumAggregateOutputType | null
    _min: CartMinAggregateOutputType | null
    _max: CartMaxAggregateOutputType | null
  }

  export type CartAvgAggregateOutputType = {
    id: number | null
    productId: number | null
    price: number | null
    quantity: number | null
  }

  export type CartSumAggregateOutputType = {
    id: number | null
    productId: number | null
    price: number | null
    quantity: number | null
  }

  export type CartMinAggregateOutputType = {
    id: number | null
    userId: string | null
    storeSlug: string | null
    productId: number | null
    title: string | null
    price: number | null
    quantity: number | null
    updatedAt: Date | null
  }

  export type CartMaxAggregateOutputType = {
    id: number | null
    userId: string | null
    storeSlug: string | null
    productId: number | null
    title: string | null
    price: number | null
    quantity: number | null
    updatedAt: Date | null
  }

  export type CartCountAggregateOutputType = {
    id: number
    userId: number
    storeSlug: number
    productId: number
    title: number
    price: number
    quantity: number
    updatedAt: number
    _all: number
  }


  export type CartAvgAggregateInputType = {
    id?: true
    productId?: true
    price?: true
    quantity?: true
  }

  export type CartSumAggregateInputType = {
    id?: true
    productId?: true
    price?: true
    quantity?: true
  }

  export type CartMinAggregateInputType = {
    id?: true
    userId?: true
    storeSlug?: true
    productId?: true
    title?: true
    price?: true
    quantity?: true
    updatedAt?: true
  }

  export type CartMaxAggregateInputType = {
    id?: true
    userId?: true
    storeSlug?: true
    productId?: true
    title?: true
    price?: true
    quantity?: true
    updatedAt?: true
  }

  export type CartCountAggregateInputType = {
    id?: true
    userId?: true
    storeSlug?: true
    productId?: true
    title?: true
    price?: true
    quantity?: true
    updatedAt?: true
    _all?: true
  }

  export type CartAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Cart to aggregate.
     */
    where?: CartWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Carts to fetch.
     */
    orderBy?: CartOrderByWithRelationInput | CartOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CartWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Carts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Carts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Carts
    **/
    _count?: true | CartCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CartAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CartSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CartMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CartMaxAggregateInputType
  }

  export type GetCartAggregateType<T extends CartAggregateArgs> = {
        [P in keyof T & keyof AggregateCart]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCart[P]>
      : GetScalarType<T[P], AggregateCart[P]>
  }




  export type CartGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CartWhereInput
    orderBy?: CartOrderByWithAggregationInput | CartOrderByWithAggregationInput[]
    by: CartScalarFieldEnum[] | CartScalarFieldEnum
    having?: CartScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CartCountAggregateInputType | true
    _avg?: CartAvgAggregateInputType
    _sum?: CartSumAggregateInputType
    _min?: CartMinAggregateInputType
    _max?: CartMaxAggregateInputType
  }

  export type CartGroupByOutputType = {
    id: number
    userId: string
    storeSlug: string
    productId: number
    title: string
    price: number
    quantity: number
    updatedAt: Date
    _count: CartCountAggregateOutputType | null
    _avg: CartAvgAggregateOutputType | null
    _sum: CartSumAggregateOutputType | null
    _min: CartMinAggregateOutputType | null
    _max: CartMaxAggregateOutputType | null
  }

  type GetCartGroupByPayload<T extends CartGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CartGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CartGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CartGroupByOutputType[P]>
            : GetScalarType<T[P], CartGroupByOutputType[P]>
        }
      >
    >


  export type CartSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    storeSlug?: boolean
    productId?: boolean
    title?: boolean
    price?: boolean
    quantity?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["cart"]>

  export type CartSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    storeSlug?: boolean
    productId?: boolean
    title?: boolean
    price?: boolean
    quantity?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["cart"]>

  export type CartSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    storeSlug?: boolean
    productId?: boolean
    title?: boolean
    price?: boolean
    quantity?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["cart"]>

  export type CartSelectScalar = {
    id?: boolean
    userId?: boolean
    storeSlug?: boolean
    productId?: boolean
    title?: boolean
    price?: boolean
    quantity?: boolean
    updatedAt?: boolean
  }

  export type CartOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "storeSlug" | "productId" | "title" | "price" | "quantity" | "updatedAt", ExtArgs["result"]["cart"]>

  export type $CartPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Cart"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      userId: string
      storeSlug: string
      productId: number
      title: string
      price: number
      quantity: number
      updatedAt: Date
    }, ExtArgs["result"]["cart"]>
    composites: {}
  }

  type CartGetPayload<S extends boolean | null | undefined | CartDefaultArgs> = $Result.GetResult<Prisma.$CartPayload, S>

  type CartCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CartFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CartCountAggregateInputType | true
    }

  export interface CartDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Cart'], meta: { name: 'Cart' } }
    /**
     * Find zero or one Cart that matches the filter.
     * @param {CartFindUniqueArgs} args - Arguments to find a Cart
     * @example
     * // Get one Cart
     * const cart = await prisma.cart.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CartFindUniqueArgs>(args: SelectSubset<T, CartFindUniqueArgs<ExtArgs>>): Prisma__CartClient<$Result.GetResult<Prisma.$CartPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Cart that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CartFindUniqueOrThrowArgs} args - Arguments to find a Cart
     * @example
     * // Get one Cart
     * const cart = await prisma.cart.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CartFindUniqueOrThrowArgs>(args: SelectSubset<T, CartFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CartClient<$Result.GetResult<Prisma.$CartPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Cart that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CartFindFirstArgs} args - Arguments to find a Cart
     * @example
     * // Get one Cart
     * const cart = await prisma.cart.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CartFindFirstArgs>(args?: SelectSubset<T, CartFindFirstArgs<ExtArgs>>): Prisma__CartClient<$Result.GetResult<Prisma.$CartPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Cart that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CartFindFirstOrThrowArgs} args - Arguments to find a Cart
     * @example
     * // Get one Cart
     * const cart = await prisma.cart.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CartFindFirstOrThrowArgs>(args?: SelectSubset<T, CartFindFirstOrThrowArgs<ExtArgs>>): Prisma__CartClient<$Result.GetResult<Prisma.$CartPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Carts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CartFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Carts
     * const carts = await prisma.cart.findMany()
     * 
     * // Get first 10 Carts
     * const carts = await prisma.cart.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cartWithIdOnly = await prisma.cart.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CartFindManyArgs>(args?: SelectSubset<T, CartFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CartPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Cart.
     * @param {CartCreateArgs} args - Arguments to create a Cart.
     * @example
     * // Create one Cart
     * const Cart = await prisma.cart.create({
     *   data: {
     *     // ... data to create a Cart
     *   }
     * })
     * 
     */
    create<T extends CartCreateArgs>(args: SelectSubset<T, CartCreateArgs<ExtArgs>>): Prisma__CartClient<$Result.GetResult<Prisma.$CartPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Carts.
     * @param {CartCreateManyArgs} args - Arguments to create many Carts.
     * @example
     * // Create many Carts
     * const cart = await prisma.cart.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CartCreateManyArgs>(args?: SelectSubset<T, CartCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Carts and returns the data saved in the database.
     * @param {CartCreateManyAndReturnArgs} args - Arguments to create many Carts.
     * @example
     * // Create many Carts
     * const cart = await prisma.cart.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Carts and only return the `id`
     * const cartWithIdOnly = await prisma.cart.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CartCreateManyAndReturnArgs>(args?: SelectSubset<T, CartCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CartPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Cart.
     * @param {CartDeleteArgs} args - Arguments to delete one Cart.
     * @example
     * // Delete one Cart
     * const Cart = await prisma.cart.delete({
     *   where: {
     *     // ... filter to delete one Cart
     *   }
     * })
     * 
     */
    delete<T extends CartDeleteArgs>(args: SelectSubset<T, CartDeleteArgs<ExtArgs>>): Prisma__CartClient<$Result.GetResult<Prisma.$CartPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Cart.
     * @param {CartUpdateArgs} args - Arguments to update one Cart.
     * @example
     * // Update one Cart
     * const cart = await prisma.cart.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CartUpdateArgs>(args: SelectSubset<T, CartUpdateArgs<ExtArgs>>): Prisma__CartClient<$Result.GetResult<Prisma.$CartPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Carts.
     * @param {CartDeleteManyArgs} args - Arguments to filter Carts to delete.
     * @example
     * // Delete a few Carts
     * const { count } = await prisma.cart.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CartDeleteManyArgs>(args?: SelectSubset<T, CartDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Carts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CartUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Carts
     * const cart = await prisma.cart.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CartUpdateManyArgs>(args: SelectSubset<T, CartUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Carts and returns the data updated in the database.
     * @param {CartUpdateManyAndReturnArgs} args - Arguments to update many Carts.
     * @example
     * // Update many Carts
     * const cart = await prisma.cart.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Carts and only return the `id`
     * const cartWithIdOnly = await prisma.cart.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CartUpdateManyAndReturnArgs>(args: SelectSubset<T, CartUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CartPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Cart.
     * @param {CartUpsertArgs} args - Arguments to update or create a Cart.
     * @example
     * // Update or create a Cart
     * const cart = await prisma.cart.upsert({
     *   create: {
     *     // ... data to create a Cart
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Cart we want to update
     *   }
     * })
     */
    upsert<T extends CartUpsertArgs>(args: SelectSubset<T, CartUpsertArgs<ExtArgs>>): Prisma__CartClient<$Result.GetResult<Prisma.$CartPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Carts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CartCountArgs} args - Arguments to filter Carts to count.
     * @example
     * // Count the number of Carts
     * const count = await prisma.cart.count({
     *   where: {
     *     // ... the filter for the Carts we want to count
     *   }
     * })
    **/
    count<T extends CartCountArgs>(
      args?: Subset<T, CartCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CartCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Cart.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CartAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CartAggregateArgs>(args: Subset<T, CartAggregateArgs>): Prisma.PrismaPromise<GetCartAggregateType<T>>

    /**
     * Group by Cart.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CartGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CartGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CartGroupByArgs['orderBy'] }
        : { orderBy?: CartGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CartGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCartGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Cart model
   */
  readonly fields: CartFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Cart.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CartClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Cart model
   */
  interface CartFieldRefs {
    readonly id: FieldRef<"Cart", 'Int'>
    readonly userId: FieldRef<"Cart", 'String'>
    readonly storeSlug: FieldRef<"Cart", 'String'>
    readonly productId: FieldRef<"Cart", 'Int'>
    readonly title: FieldRef<"Cart", 'String'>
    readonly price: FieldRef<"Cart", 'Float'>
    readonly quantity: FieldRef<"Cart", 'Int'>
    readonly updatedAt: FieldRef<"Cart", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Cart findUnique
   */
  export type CartFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cart
     */
    select?: CartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cart
     */
    omit?: CartOmit<ExtArgs> | null
    /**
     * Filter, which Cart to fetch.
     */
    where: CartWhereUniqueInput
  }

  /**
   * Cart findUniqueOrThrow
   */
  export type CartFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cart
     */
    select?: CartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cart
     */
    omit?: CartOmit<ExtArgs> | null
    /**
     * Filter, which Cart to fetch.
     */
    where: CartWhereUniqueInput
  }

  /**
   * Cart findFirst
   */
  export type CartFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cart
     */
    select?: CartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cart
     */
    omit?: CartOmit<ExtArgs> | null
    /**
     * Filter, which Cart to fetch.
     */
    where?: CartWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Carts to fetch.
     */
    orderBy?: CartOrderByWithRelationInput | CartOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Carts.
     */
    cursor?: CartWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Carts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Carts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Carts.
     */
    distinct?: CartScalarFieldEnum | CartScalarFieldEnum[]
  }

  /**
   * Cart findFirstOrThrow
   */
  export type CartFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cart
     */
    select?: CartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cart
     */
    omit?: CartOmit<ExtArgs> | null
    /**
     * Filter, which Cart to fetch.
     */
    where?: CartWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Carts to fetch.
     */
    orderBy?: CartOrderByWithRelationInput | CartOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Carts.
     */
    cursor?: CartWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Carts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Carts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Carts.
     */
    distinct?: CartScalarFieldEnum | CartScalarFieldEnum[]
  }

  /**
   * Cart findMany
   */
  export type CartFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cart
     */
    select?: CartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cart
     */
    omit?: CartOmit<ExtArgs> | null
    /**
     * Filter, which Carts to fetch.
     */
    where?: CartWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Carts to fetch.
     */
    orderBy?: CartOrderByWithRelationInput | CartOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Carts.
     */
    cursor?: CartWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Carts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Carts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Carts.
     */
    distinct?: CartScalarFieldEnum | CartScalarFieldEnum[]
  }

  /**
   * Cart create
   */
  export type CartCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cart
     */
    select?: CartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cart
     */
    omit?: CartOmit<ExtArgs> | null
    /**
     * The data needed to create a Cart.
     */
    data: XOR<CartCreateInput, CartUncheckedCreateInput>
  }

  /**
   * Cart createMany
   */
  export type CartCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Carts.
     */
    data: CartCreateManyInput | CartCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Cart createManyAndReturn
   */
  export type CartCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cart
     */
    select?: CartSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Cart
     */
    omit?: CartOmit<ExtArgs> | null
    /**
     * The data used to create many Carts.
     */
    data: CartCreateManyInput | CartCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Cart update
   */
  export type CartUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cart
     */
    select?: CartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cart
     */
    omit?: CartOmit<ExtArgs> | null
    /**
     * The data needed to update a Cart.
     */
    data: XOR<CartUpdateInput, CartUncheckedUpdateInput>
    /**
     * Choose, which Cart to update.
     */
    where: CartWhereUniqueInput
  }

  /**
   * Cart updateMany
   */
  export type CartUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Carts.
     */
    data: XOR<CartUpdateManyMutationInput, CartUncheckedUpdateManyInput>
    /**
     * Filter which Carts to update
     */
    where?: CartWhereInput
    /**
     * Limit how many Carts to update.
     */
    limit?: number
  }

  /**
   * Cart updateManyAndReturn
   */
  export type CartUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cart
     */
    select?: CartSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Cart
     */
    omit?: CartOmit<ExtArgs> | null
    /**
     * The data used to update Carts.
     */
    data: XOR<CartUpdateManyMutationInput, CartUncheckedUpdateManyInput>
    /**
     * Filter which Carts to update
     */
    where?: CartWhereInput
    /**
     * Limit how many Carts to update.
     */
    limit?: number
  }

  /**
   * Cart upsert
   */
  export type CartUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cart
     */
    select?: CartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cart
     */
    omit?: CartOmit<ExtArgs> | null
    /**
     * The filter to search for the Cart to update in case it exists.
     */
    where: CartWhereUniqueInput
    /**
     * In case the Cart found by the `where` argument doesn't exist, create a new Cart with this data.
     */
    create: XOR<CartCreateInput, CartUncheckedCreateInput>
    /**
     * In case the Cart was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CartUpdateInput, CartUncheckedUpdateInput>
  }

  /**
   * Cart delete
   */
  export type CartDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cart
     */
    select?: CartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cart
     */
    omit?: CartOmit<ExtArgs> | null
    /**
     * Filter which Cart to delete.
     */
    where: CartWhereUniqueInput
  }

  /**
   * Cart deleteMany
   */
  export type CartDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Carts to delete
     */
    where?: CartWhereInput
    /**
     * Limit how many Carts to delete.
     */
    limit?: number
  }

  /**
   * Cart without action
   */
  export type CartDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cart
     */
    select?: CartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cart
     */
    omit?: CartOmit<ExtArgs> | null
  }


  /**
   * Model CachedCategory
   */

  export type AggregateCachedCategory = {
    _count: CachedCategoryCountAggregateOutputType | null
    _avg: CachedCategoryAvgAggregateOutputType | null
    _sum: CachedCategorySumAggregateOutputType | null
    _min: CachedCategoryMinAggregateOutputType | null
    _max: CachedCategoryMaxAggregateOutputType | null
  }

  export type CachedCategoryAvgAggregateOutputType = {
    id: number | null
    sellerId: number | null
    parentId: number | null
  }

  export type CachedCategorySumAggregateOutputType = {
    id: number | null
    sellerId: number | null
    parentId: number | null
  }

  export type CachedCategoryMinAggregateOutputType = {
    id: number | null
    storeSlug: string | null
    sellerId: number | null
    name: string | null
    parentId: number | null
    syncedAt: Date | null
  }

  export type CachedCategoryMaxAggregateOutputType = {
    id: number | null
    storeSlug: string | null
    sellerId: number | null
    name: string | null
    parentId: number | null
    syncedAt: Date | null
  }

  export type CachedCategoryCountAggregateOutputType = {
    id: number
    storeSlug: number
    sellerId: number
    name: number
    parentId: number
    syncedAt: number
    _all: number
  }


  export type CachedCategoryAvgAggregateInputType = {
    id?: true
    sellerId?: true
    parentId?: true
  }

  export type CachedCategorySumAggregateInputType = {
    id?: true
    sellerId?: true
    parentId?: true
  }

  export type CachedCategoryMinAggregateInputType = {
    id?: true
    storeSlug?: true
    sellerId?: true
    name?: true
    parentId?: true
    syncedAt?: true
  }

  export type CachedCategoryMaxAggregateInputType = {
    id?: true
    storeSlug?: true
    sellerId?: true
    name?: true
    parentId?: true
    syncedAt?: true
  }

  export type CachedCategoryCountAggregateInputType = {
    id?: true
    storeSlug?: true
    sellerId?: true
    name?: true
    parentId?: true
    syncedAt?: true
    _all?: true
  }

  export type CachedCategoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CachedCategory to aggregate.
     */
    where?: CachedCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CachedCategories to fetch.
     */
    orderBy?: CachedCategoryOrderByWithRelationInput | CachedCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CachedCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CachedCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CachedCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CachedCategories
    **/
    _count?: true | CachedCategoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CachedCategoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CachedCategorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CachedCategoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CachedCategoryMaxAggregateInputType
  }

  export type GetCachedCategoryAggregateType<T extends CachedCategoryAggregateArgs> = {
        [P in keyof T & keyof AggregateCachedCategory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCachedCategory[P]>
      : GetScalarType<T[P], AggregateCachedCategory[P]>
  }




  export type CachedCategoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CachedCategoryWhereInput
    orderBy?: CachedCategoryOrderByWithAggregationInput | CachedCategoryOrderByWithAggregationInput[]
    by: CachedCategoryScalarFieldEnum[] | CachedCategoryScalarFieldEnum
    having?: CachedCategoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CachedCategoryCountAggregateInputType | true
    _avg?: CachedCategoryAvgAggregateInputType
    _sum?: CachedCategorySumAggregateInputType
    _min?: CachedCategoryMinAggregateInputType
    _max?: CachedCategoryMaxAggregateInputType
  }

  export type CachedCategoryGroupByOutputType = {
    id: number
    storeSlug: string
    sellerId: number
    name: string
    parentId: number | null
    syncedAt: Date
    _count: CachedCategoryCountAggregateOutputType | null
    _avg: CachedCategoryAvgAggregateOutputType | null
    _sum: CachedCategorySumAggregateOutputType | null
    _min: CachedCategoryMinAggregateOutputType | null
    _max: CachedCategoryMaxAggregateOutputType | null
  }

  type GetCachedCategoryGroupByPayload<T extends CachedCategoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CachedCategoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CachedCategoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CachedCategoryGroupByOutputType[P]>
            : GetScalarType<T[P], CachedCategoryGroupByOutputType[P]>
        }
      >
    >


  export type CachedCategorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    storeSlug?: boolean
    sellerId?: boolean
    name?: boolean
    parentId?: boolean
    syncedAt?: boolean
  }, ExtArgs["result"]["cachedCategory"]>

  export type CachedCategorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    storeSlug?: boolean
    sellerId?: boolean
    name?: boolean
    parentId?: boolean
    syncedAt?: boolean
  }, ExtArgs["result"]["cachedCategory"]>

  export type CachedCategorySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    storeSlug?: boolean
    sellerId?: boolean
    name?: boolean
    parentId?: boolean
    syncedAt?: boolean
  }, ExtArgs["result"]["cachedCategory"]>

  export type CachedCategorySelectScalar = {
    id?: boolean
    storeSlug?: boolean
    sellerId?: boolean
    name?: boolean
    parentId?: boolean
    syncedAt?: boolean
  }

  export type CachedCategoryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "storeSlug" | "sellerId" | "name" | "parentId" | "syncedAt", ExtArgs["result"]["cachedCategory"]>

  export type $CachedCategoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CachedCategory"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      storeSlug: string
      sellerId: number
      name: string
      parentId: number | null
      syncedAt: Date
    }, ExtArgs["result"]["cachedCategory"]>
    composites: {}
  }

  type CachedCategoryGetPayload<S extends boolean | null | undefined | CachedCategoryDefaultArgs> = $Result.GetResult<Prisma.$CachedCategoryPayload, S>

  type CachedCategoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CachedCategoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CachedCategoryCountAggregateInputType | true
    }

  export interface CachedCategoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CachedCategory'], meta: { name: 'CachedCategory' } }
    /**
     * Find zero or one CachedCategory that matches the filter.
     * @param {CachedCategoryFindUniqueArgs} args - Arguments to find a CachedCategory
     * @example
     * // Get one CachedCategory
     * const cachedCategory = await prisma.cachedCategory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CachedCategoryFindUniqueArgs>(args: SelectSubset<T, CachedCategoryFindUniqueArgs<ExtArgs>>): Prisma__CachedCategoryClient<$Result.GetResult<Prisma.$CachedCategoryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CachedCategory that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CachedCategoryFindUniqueOrThrowArgs} args - Arguments to find a CachedCategory
     * @example
     * // Get one CachedCategory
     * const cachedCategory = await prisma.cachedCategory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CachedCategoryFindUniqueOrThrowArgs>(args: SelectSubset<T, CachedCategoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CachedCategoryClient<$Result.GetResult<Prisma.$CachedCategoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CachedCategory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedCategoryFindFirstArgs} args - Arguments to find a CachedCategory
     * @example
     * // Get one CachedCategory
     * const cachedCategory = await prisma.cachedCategory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CachedCategoryFindFirstArgs>(args?: SelectSubset<T, CachedCategoryFindFirstArgs<ExtArgs>>): Prisma__CachedCategoryClient<$Result.GetResult<Prisma.$CachedCategoryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CachedCategory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedCategoryFindFirstOrThrowArgs} args - Arguments to find a CachedCategory
     * @example
     * // Get one CachedCategory
     * const cachedCategory = await prisma.cachedCategory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CachedCategoryFindFirstOrThrowArgs>(args?: SelectSubset<T, CachedCategoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__CachedCategoryClient<$Result.GetResult<Prisma.$CachedCategoryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CachedCategories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedCategoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CachedCategories
     * const cachedCategories = await prisma.cachedCategory.findMany()
     * 
     * // Get first 10 CachedCategories
     * const cachedCategories = await prisma.cachedCategory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cachedCategoryWithIdOnly = await prisma.cachedCategory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CachedCategoryFindManyArgs>(args?: SelectSubset<T, CachedCategoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CachedCategoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CachedCategory.
     * @param {CachedCategoryCreateArgs} args - Arguments to create a CachedCategory.
     * @example
     * // Create one CachedCategory
     * const CachedCategory = await prisma.cachedCategory.create({
     *   data: {
     *     // ... data to create a CachedCategory
     *   }
     * })
     * 
     */
    create<T extends CachedCategoryCreateArgs>(args: SelectSubset<T, CachedCategoryCreateArgs<ExtArgs>>): Prisma__CachedCategoryClient<$Result.GetResult<Prisma.$CachedCategoryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CachedCategories.
     * @param {CachedCategoryCreateManyArgs} args - Arguments to create many CachedCategories.
     * @example
     * // Create many CachedCategories
     * const cachedCategory = await prisma.cachedCategory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CachedCategoryCreateManyArgs>(args?: SelectSubset<T, CachedCategoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CachedCategories and returns the data saved in the database.
     * @param {CachedCategoryCreateManyAndReturnArgs} args - Arguments to create many CachedCategories.
     * @example
     * // Create many CachedCategories
     * const cachedCategory = await prisma.cachedCategory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CachedCategories and only return the `id`
     * const cachedCategoryWithIdOnly = await prisma.cachedCategory.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CachedCategoryCreateManyAndReturnArgs>(args?: SelectSubset<T, CachedCategoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CachedCategoryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CachedCategory.
     * @param {CachedCategoryDeleteArgs} args - Arguments to delete one CachedCategory.
     * @example
     * // Delete one CachedCategory
     * const CachedCategory = await prisma.cachedCategory.delete({
     *   where: {
     *     // ... filter to delete one CachedCategory
     *   }
     * })
     * 
     */
    delete<T extends CachedCategoryDeleteArgs>(args: SelectSubset<T, CachedCategoryDeleteArgs<ExtArgs>>): Prisma__CachedCategoryClient<$Result.GetResult<Prisma.$CachedCategoryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CachedCategory.
     * @param {CachedCategoryUpdateArgs} args - Arguments to update one CachedCategory.
     * @example
     * // Update one CachedCategory
     * const cachedCategory = await prisma.cachedCategory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CachedCategoryUpdateArgs>(args: SelectSubset<T, CachedCategoryUpdateArgs<ExtArgs>>): Prisma__CachedCategoryClient<$Result.GetResult<Prisma.$CachedCategoryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CachedCategories.
     * @param {CachedCategoryDeleteManyArgs} args - Arguments to filter CachedCategories to delete.
     * @example
     * // Delete a few CachedCategories
     * const { count } = await prisma.cachedCategory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CachedCategoryDeleteManyArgs>(args?: SelectSubset<T, CachedCategoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CachedCategories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedCategoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CachedCategories
     * const cachedCategory = await prisma.cachedCategory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CachedCategoryUpdateManyArgs>(args: SelectSubset<T, CachedCategoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CachedCategories and returns the data updated in the database.
     * @param {CachedCategoryUpdateManyAndReturnArgs} args - Arguments to update many CachedCategories.
     * @example
     * // Update many CachedCategories
     * const cachedCategory = await prisma.cachedCategory.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CachedCategories and only return the `id`
     * const cachedCategoryWithIdOnly = await prisma.cachedCategory.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CachedCategoryUpdateManyAndReturnArgs>(args: SelectSubset<T, CachedCategoryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CachedCategoryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CachedCategory.
     * @param {CachedCategoryUpsertArgs} args - Arguments to update or create a CachedCategory.
     * @example
     * // Update or create a CachedCategory
     * const cachedCategory = await prisma.cachedCategory.upsert({
     *   create: {
     *     // ... data to create a CachedCategory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CachedCategory we want to update
     *   }
     * })
     */
    upsert<T extends CachedCategoryUpsertArgs>(args: SelectSubset<T, CachedCategoryUpsertArgs<ExtArgs>>): Prisma__CachedCategoryClient<$Result.GetResult<Prisma.$CachedCategoryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CachedCategories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedCategoryCountArgs} args - Arguments to filter CachedCategories to count.
     * @example
     * // Count the number of CachedCategories
     * const count = await prisma.cachedCategory.count({
     *   where: {
     *     // ... the filter for the CachedCategories we want to count
     *   }
     * })
    **/
    count<T extends CachedCategoryCountArgs>(
      args?: Subset<T, CachedCategoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CachedCategoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CachedCategory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedCategoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CachedCategoryAggregateArgs>(args: Subset<T, CachedCategoryAggregateArgs>): Prisma.PrismaPromise<GetCachedCategoryAggregateType<T>>

    /**
     * Group by CachedCategory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedCategoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CachedCategoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CachedCategoryGroupByArgs['orderBy'] }
        : { orderBy?: CachedCategoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CachedCategoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCachedCategoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CachedCategory model
   */
  readonly fields: CachedCategoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CachedCategory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CachedCategoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CachedCategory model
   */
  interface CachedCategoryFieldRefs {
    readonly id: FieldRef<"CachedCategory", 'Int'>
    readonly storeSlug: FieldRef<"CachedCategory", 'String'>
    readonly sellerId: FieldRef<"CachedCategory", 'Int'>
    readonly name: FieldRef<"CachedCategory", 'String'>
    readonly parentId: FieldRef<"CachedCategory", 'Int'>
    readonly syncedAt: FieldRef<"CachedCategory", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CachedCategory findUnique
   */
  export type CachedCategoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedCategory
     */
    select?: CachedCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedCategory
     */
    omit?: CachedCategoryOmit<ExtArgs> | null
    /**
     * Filter, which CachedCategory to fetch.
     */
    where: CachedCategoryWhereUniqueInput
  }

  /**
   * CachedCategory findUniqueOrThrow
   */
  export type CachedCategoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedCategory
     */
    select?: CachedCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedCategory
     */
    omit?: CachedCategoryOmit<ExtArgs> | null
    /**
     * Filter, which CachedCategory to fetch.
     */
    where: CachedCategoryWhereUniqueInput
  }

  /**
   * CachedCategory findFirst
   */
  export type CachedCategoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedCategory
     */
    select?: CachedCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedCategory
     */
    omit?: CachedCategoryOmit<ExtArgs> | null
    /**
     * Filter, which CachedCategory to fetch.
     */
    where?: CachedCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CachedCategories to fetch.
     */
    orderBy?: CachedCategoryOrderByWithRelationInput | CachedCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CachedCategories.
     */
    cursor?: CachedCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CachedCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CachedCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CachedCategories.
     */
    distinct?: CachedCategoryScalarFieldEnum | CachedCategoryScalarFieldEnum[]
  }

  /**
   * CachedCategory findFirstOrThrow
   */
  export type CachedCategoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedCategory
     */
    select?: CachedCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedCategory
     */
    omit?: CachedCategoryOmit<ExtArgs> | null
    /**
     * Filter, which CachedCategory to fetch.
     */
    where?: CachedCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CachedCategories to fetch.
     */
    orderBy?: CachedCategoryOrderByWithRelationInput | CachedCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CachedCategories.
     */
    cursor?: CachedCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CachedCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CachedCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CachedCategories.
     */
    distinct?: CachedCategoryScalarFieldEnum | CachedCategoryScalarFieldEnum[]
  }

  /**
   * CachedCategory findMany
   */
  export type CachedCategoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedCategory
     */
    select?: CachedCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedCategory
     */
    omit?: CachedCategoryOmit<ExtArgs> | null
    /**
     * Filter, which CachedCategories to fetch.
     */
    where?: CachedCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CachedCategories to fetch.
     */
    orderBy?: CachedCategoryOrderByWithRelationInput | CachedCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CachedCategories.
     */
    cursor?: CachedCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CachedCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CachedCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CachedCategories.
     */
    distinct?: CachedCategoryScalarFieldEnum | CachedCategoryScalarFieldEnum[]
  }

  /**
   * CachedCategory create
   */
  export type CachedCategoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedCategory
     */
    select?: CachedCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedCategory
     */
    omit?: CachedCategoryOmit<ExtArgs> | null
    /**
     * The data needed to create a CachedCategory.
     */
    data: XOR<CachedCategoryCreateInput, CachedCategoryUncheckedCreateInput>
  }

  /**
   * CachedCategory createMany
   */
  export type CachedCategoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CachedCategories.
     */
    data: CachedCategoryCreateManyInput | CachedCategoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CachedCategory createManyAndReturn
   */
  export type CachedCategoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedCategory
     */
    select?: CachedCategorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CachedCategory
     */
    omit?: CachedCategoryOmit<ExtArgs> | null
    /**
     * The data used to create many CachedCategories.
     */
    data: CachedCategoryCreateManyInput | CachedCategoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CachedCategory update
   */
  export type CachedCategoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedCategory
     */
    select?: CachedCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedCategory
     */
    omit?: CachedCategoryOmit<ExtArgs> | null
    /**
     * The data needed to update a CachedCategory.
     */
    data: XOR<CachedCategoryUpdateInput, CachedCategoryUncheckedUpdateInput>
    /**
     * Choose, which CachedCategory to update.
     */
    where: CachedCategoryWhereUniqueInput
  }

  /**
   * CachedCategory updateMany
   */
  export type CachedCategoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CachedCategories.
     */
    data: XOR<CachedCategoryUpdateManyMutationInput, CachedCategoryUncheckedUpdateManyInput>
    /**
     * Filter which CachedCategories to update
     */
    where?: CachedCategoryWhereInput
    /**
     * Limit how many CachedCategories to update.
     */
    limit?: number
  }

  /**
   * CachedCategory updateManyAndReturn
   */
  export type CachedCategoryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedCategory
     */
    select?: CachedCategorySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CachedCategory
     */
    omit?: CachedCategoryOmit<ExtArgs> | null
    /**
     * The data used to update CachedCategories.
     */
    data: XOR<CachedCategoryUpdateManyMutationInput, CachedCategoryUncheckedUpdateManyInput>
    /**
     * Filter which CachedCategories to update
     */
    where?: CachedCategoryWhereInput
    /**
     * Limit how many CachedCategories to update.
     */
    limit?: number
  }

  /**
   * CachedCategory upsert
   */
  export type CachedCategoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedCategory
     */
    select?: CachedCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedCategory
     */
    omit?: CachedCategoryOmit<ExtArgs> | null
    /**
     * The filter to search for the CachedCategory to update in case it exists.
     */
    where: CachedCategoryWhereUniqueInput
    /**
     * In case the CachedCategory found by the `where` argument doesn't exist, create a new CachedCategory with this data.
     */
    create: XOR<CachedCategoryCreateInput, CachedCategoryUncheckedCreateInput>
    /**
     * In case the CachedCategory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CachedCategoryUpdateInput, CachedCategoryUncheckedUpdateInput>
  }

  /**
   * CachedCategory delete
   */
  export type CachedCategoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedCategory
     */
    select?: CachedCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedCategory
     */
    omit?: CachedCategoryOmit<ExtArgs> | null
    /**
     * Filter which CachedCategory to delete.
     */
    where: CachedCategoryWhereUniqueInput
  }

  /**
   * CachedCategory deleteMany
   */
  export type CachedCategoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CachedCategories to delete
     */
    where?: CachedCategoryWhereInput
    /**
     * Limit how many CachedCategories to delete.
     */
    limit?: number
  }

  /**
   * CachedCategory without action
   */
  export type CachedCategoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedCategory
     */
    select?: CachedCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedCategory
     */
    omit?: CachedCategoryOmit<ExtArgs> | null
  }


  /**
   * Model CachedProduct
   */

  export type AggregateCachedProduct = {
    _count: CachedProductCountAggregateOutputType | null
    _avg: CachedProductAvgAggregateOutputType | null
    _sum: CachedProductSumAggregateOutputType | null
    _min: CachedProductMinAggregateOutputType | null
    _max: CachedProductMaxAggregateOutputType | null
  }

  export type CachedProductAvgAggregateOutputType = {
    id: number | null
    sellerId: number | null
    price: number | null
    stockQuantity: number | null
    categoryId: number | null
  }

  export type CachedProductSumAggregateOutputType = {
    id: number | null
    sellerId: number | null
    price: number | null
    stockQuantity: number | null
    categoryId: number | null
  }

  export type CachedProductMinAggregateOutputType = {
    id: number | null
    storeSlug: string | null
    sellerId: number | null
    title: string | null
    description: string | null
    sku: string | null
    price: number | null
    stockQuantity: number | null
    categoryId: number | null
    active: boolean | null
    syncedAt: Date | null
  }

  export type CachedProductMaxAggregateOutputType = {
    id: number | null
    storeSlug: string | null
    sellerId: number | null
    title: string | null
    description: string | null
    sku: string | null
    price: number | null
    stockQuantity: number | null
    categoryId: number | null
    active: boolean | null
    syncedAt: Date | null
  }

  export type CachedProductCountAggregateOutputType = {
    id: number
    storeSlug: number
    sellerId: number
    title: number
    description: number
    sku: number
    price: number
    stockQuantity: number
    categoryId: number
    tags: number
    images: number
    active: number
    syncedAt: number
    _all: number
  }


  export type CachedProductAvgAggregateInputType = {
    id?: true
    sellerId?: true
    price?: true
    stockQuantity?: true
    categoryId?: true
  }

  export type CachedProductSumAggregateInputType = {
    id?: true
    sellerId?: true
    price?: true
    stockQuantity?: true
    categoryId?: true
  }

  export type CachedProductMinAggregateInputType = {
    id?: true
    storeSlug?: true
    sellerId?: true
    title?: true
    description?: true
    sku?: true
    price?: true
    stockQuantity?: true
    categoryId?: true
    active?: true
    syncedAt?: true
  }

  export type CachedProductMaxAggregateInputType = {
    id?: true
    storeSlug?: true
    sellerId?: true
    title?: true
    description?: true
    sku?: true
    price?: true
    stockQuantity?: true
    categoryId?: true
    active?: true
    syncedAt?: true
  }

  export type CachedProductCountAggregateInputType = {
    id?: true
    storeSlug?: true
    sellerId?: true
    title?: true
    description?: true
    sku?: true
    price?: true
    stockQuantity?: true
    categoryId?: true
    tags?: true
    images?: true
    active?: true
    syncedAt?: true
    _all?: true
  }

  export type CachedProductAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CachedProduct to aggregate.
     */
    where?: CachedProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CachedProducts to fetch.
     */
    orderBy?: CachedProductOrderByWithRelationInput | CachedProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CachedProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CachedProducts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CachedProducts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CachedProducts
    **/
    _count?: true | CachedProductCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CachedProductAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CachedProductSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CachedProductMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CachedProductMaxAggregateInputType
  }

  export type GetCachedProductAggregateType<T extends CachedProductAggregateArgs> = {
        [P in keyof T & keyof AggregateCachedProduct]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCachedProduct[P]>
      : GetScalarType<T[P], AggregateCachedProduct[P]>
  }




  export type CachedProductGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CachedProductWhereInput
    orderBy?: CachedProductOrderByWithAggregationInput | CachedProductOrderByWithAggregationInput[]
    by: CachedProductScalarFieldEnum[] | CachedProductScalarFieldEnum
    having?: CachedProductScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CachedProductCountAggregateInputType | true
    _avg?: CachedProductAvgAggregateInputType
    _sum?: CachedProductSumAggregateInputType
    _min?: CachedProductMinAggregateInputType
    _max?: CachedProductMaxAggregateInputType
  }

  export type CachedProductGroupByOutputType = {
    id: number
    storeSlug: string
    sellerId: number
    title: string
    description: string | null
    sku: string | null
    price: number | null
    stockQuantity: number
    categoryId: number | null
    tags: string[]
    images: string[]
    active: boolean
    syncedAt: Date
    _count: CachedProductCountAggregateOutputType | null
    _avg: CachedProductAvgAggregateOutputType | null
    _sum: CachedProductSumAggregateOutputType | null
    _min: CachedProductMinAggregateOutputType | null
    _max: CachedProductMaxAggregateOutputType | null
  }

  type GetCachedProductGroupByPayload<T extends CachedProductGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CachedProductGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CachedProductGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CachedProductGroupByOutputType[P]>
            : GetScalarType<T[P], CachedProductGroupByOutputType[P]>
        }
      >
    >


  export type CachedProductSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    storeSlug?: boolean
    sellerId?: boolean
    title?: boolean
    description?: boolean
    sku?: boolean
    price?: boolean
    stockQuantity?: boolean
    categoryId?: boolean
    tags?: boolean
    images?: boolean
    active?: boolean
    syncedAt?: boolean
  }, ExtArgs["result"]["cachedProduct"]>

  export type CachedProductSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    storeSlug?: boolean
    sellerId?: boolean
    title?: boolean
    description?: boolean
    sku?: boolean
    price?: boolean
    stockQuantity?: boolean
    categoryId?: boolean
    tags?: boolean
    images?: boolean
    active?: boolean
    syncedAt?: boolean
  }, ExtArgs["result"]["cachedProduct"]>

  export type CachedProductSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    storeSlug?: boolean
    sellerId?: boolean
    title?: boolean
    description?: boolean
    sku?: boolean
    price?: boolean
    stockQuantity?: boolean
    categoryId?: boolean
    tags?: boolean
    images?: boolean
    active?: boolean
    syncedAt?: boolean
  }, ExtArgs["result"]["cachedProduct"]>

  export type CachedProductSelectScalar = {
    id?: boolean
    storeSlug?: boolean
    sellerId?: boolean
    title?: boolean
    description?: boolean
    sku?: boolean
    price?: boolean
    stockQuantity?: boolean
    categoryId?: boolean
    tags?: boolean
    images?: boolean
    active?: boolean
    syncedAt?: boolean
  }

  export type CachedProductOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "storeSlug" | "sellerId" | "title" | "description" | "sku" | "price" | "stockQuantity" | "categoryId" | "tags" | "images" | "active" | "syncedAt", ExtArgs["result"]["cachedProduct"]>

  export type $CachedProductPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CachedProduct"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      storeSlug: string
      sellerId: number
      title: string
      description: string | null
      sku: string | null
      price: number | null
      stockQuantity: number
      categoryId: number | null
      tags: string[]
      images: string[]
      active: boolean
      syncedAt: Date
    }, ExtArgs["result"]["cachedProduct"]>
    composites: {}
  }

  type CachedProductGetPayload<S extends boolean | null | undefined | CachedProductDefaultArgs> = $Result.GetResult<Prisma.$CachedProductPayload, S>

  type CachedProductCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CachedProductFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CachedProductCountAggregateInputType | true
    }

  export interface CachedProductDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CachedProduct'], meta: { name: 'CachedProduct' } }
    /**
     * Find zero or one CachedProduct that matches the filter.
     * @param {CachedProductFindUniqueArgs} args - Arguments to find a CachedProduct
     * @example
     * // Get one CachedProduct
     * const cachedProduct = await prisma.cachedProduct.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CachedProductFindUniqueArgs>(args: SelectSubset<T, CachedProductFindUniqueArgs<ExtArgs>>): Prisma__CachedProductClient<$Result.GetResult<Prisma.$CachedProductPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CachedProduct that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CachedProductFindUniqueOrThrowArgs} args - Arguments to find a CachedProduct
     * @example
     * // Get one CachedProduct
     * const cachedProduct = await prisma.cachedProduct.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CachedProductFindUniqueOrThrowArgs>(args: SelectSubset<T, CachedProductFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CachedProductClient<$Result.GetResult<Prisma.$CachedProductPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CachedProduct that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedProductFindFirstArgs} args - Arguments to find a CachedProduct
     * @example
     * // Get one CachedProduct
     * const cachedProduct = await prisma.cachedProduct.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CachedProductFindFirstArgs>(args?: SelectSubset<T, CachedProductFindFirstArgs<ExtArgs>>): Prisma__CachedProductClient<$Result.GetResult<Prisma.$CachedProductPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CachedProduct that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedProductFindFirstOrThrowArgs} args - Arguments to find a CachedProduct
     * @example
     * // Get one CachedProduct
     * const cachedProduct = await prisma.cachedProduct.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CachedProductFindFirstOrThrowArgs>(args?: SelectSubset<T, CachedProductFindFirstOrThrowArgs<ExtArgs>>): Prisma__CachedProductClient<$Result.GetResult<Prisma.$CachedProductPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CachedProducts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedProductFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CachedProducts
     * const cachedProducts = await prisma.cachedProduct.findMany()
     * 
     * // Get first 10 CachedProducts
     * const cachedProducts = await prisma.cachedProduct.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cachedProductWithIdOnly = await prisma.cachedProduct.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CachedProductFindManyArgs>(args?: SelectSubset<T, CachedProductFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CachedProductPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CachedProduct.
     * @param {CachedProductCreateArgs} args - Arguments to create a CachedProduct.
     * @example
     * // Create one CachedProduct
     * const CachedProduct = await prisma.cachedProduct.create({
     *   data: {
     *     // ... data to create a CachedProduct
     *   }
     * })
     * 
     */
    create<T extends CachedProductCreateArgs>(args: SelectSubset<T, CachedProductCreateArgs<ExtArgs>>): Prisma__CachedProductClient<$Result.GetResult<Prisma.$CachedProductPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CachedProducts.
     * @param {CachedProductCreateManyArgs} args - Arguments to create many CachedProducts.
     * @example
     * // Create many CachedProducts
     * const cachedProduct = await prisma.cachedProduct.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CachedProductCreateManyArgs>(args?: SelectSubset<T, CachedProductCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CachedProducts and returns the data saved in the database.
     * @param {CachedProductCreateManyAndReturnArgs} args - Arguments to create many CachedProducts.
     * @example
     * // Create many CachedProducts
     * const cachedProduct = await prisma.cachedProduct.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CachedProducts and only return the `id`
     * const cachedProductWithIdOnly = await prisma.cachedProduct.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CachedProductCreateManyAndReturnArgs>(args?: SelectSubset<T, CachedProductCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CachedProductPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CachedProduct.
     * @param {CachedProductDeleteArgs} args - Arguments to delete one CachedProduct.
     * @example
     * // Delete one CachedProduct
     * const CachedProduct = await prisma.cachedProduct.delete({
     *   where: {
     *     // ... filter to delete one CachedProduct
     *   }
     * })
     * 
     */
    delete<T extends CachedProductDeleteArgs>(args: SelectSubset<T, CachedProductDeleteArgs<ExtArgs>>): Prisma__CachedProductClient<$Result.GetResult<Prisma.$CachedProductPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CachedProduct.
     * @param {CachedProductUpdateArgs} args - Arguments to update one CachedProduct.
     * @example
     * // Update one CachedProduct
     * const cachedProduct = await prisma.cachedProduct.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CachedProductUpdateArgs>(args: SelectSubset<T, CachedProductUpdateArgs<ExtArgs>>): Prisma__CachedProductClient<$Result.GetResult<Prisma.$CachedProductPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CachedProducts.
     * @param {CachedProductDeleteManyArgs} args - Arguments to filter CachedProducts to delete.
     * @example
     * // Delete a few CachedProducts
     * const { count } = await prisma.cachedProduct.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CachedProductDeleteManyArgs>(args?: SelectSubset<T, CachedProductDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CachedProducts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedProductUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CachedProducts
     * const cachedProduct = await prisma.cachedProduct.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CachedProductUpdateManyArgs>(args: SelectSubset<T, CachedProductUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CachedProducts and returns the data updated in the database.
     * @param {CachedProductUpdateManyAndReturnArgs} args - Arguments to update many CachedProducts.
     * @example
     * // Update many CachedProducts
     * const cachedProduct = await prisma.cachedProduct.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CachedProducts and only return the `id`
     * const cachedProductWithIdOnly = await prisma.cachedProduct.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CachedProductUpdateManyAndReturnArgs>(args: SelectSubset<T, CachedProductUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CachedProductPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CachedProduct.
     * @param {CachedProductUpsertArgs} args - Arguments to update or create a CachedProduct.
     * @example
     * // Update or create a CachedProduct
     * const cachedProduct = await prisma.cachedProduct.upsert({
     *   create: {
     *     // ... data to create a CachedProduct
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CachedProduct we want to update
     *   }
     * })
     */
    upsert<T extends CachedProductUpsertArgs>(args: SelectSubset<T, CachedProductUpsertArgs<ExtArgs>>): Prisma__CachedProductClient<$Result.GetResult<Prisma.$CachedProductPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CachedProducts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedProductCountArgs} args - Arguments to filter CachedProducts to count.
     * @example
     * // Count the number of CachedProducts
     * const count = await prisma.cachedProduct.count({
     *   where: {
     *     // ... the filter for the CachedProducts we want to count
     *   }
     * })
    **/
    count<T extends CachedProductCountArgs>(
      args?: Subset<T, CachedProductCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CachedProductCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CachedProduct.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedProductAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CachedProductAggregateArgs>(args: Subset<T, CachedProductAggregateArgs>): Prisma.PrismaPromise<GetCachedProductAggregateType<T>>

    /**
     * Group by CachedProduct.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CachedProductGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CachedProductGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CachedProductGroupByArgs['orderBy'] }
        : { orderBy?: CachedProductGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CachedProductGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCachedProductGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CachedProduct model
   */
  readonly fields: CachedProductFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CachedProduct.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CachedProductClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CachedProduct model
   */
  interface CachedProductFieldRefs {
    readonly id: FieldRef<"CachedProduct", 'Int'>
    readonly storeSlug: FieldRef<"CachedProduct", 'String'>
    readonly sellerId: FieldRef<"CachedProduct", 'Int'>
    readonly title: FieldRef<"CachedProduct", 'String'>
    readonly description: FieldRef<"CachedProduct", 'String'>
    readonly sku: FieldRef<"CachedProduct", 'String'>
    readonly price: FieldRef<"CachedProduct", 'Float'>
    readonly stockQuantity: FieldRef<"CachedProduct", 'Int'>
    readonly categoryId: FieldRef<"CachedProduct", 'Int'>
    readonly tags: FieldRef<"CachedProduct", 'String[]'>
    readonly images: FieldRef<"CachedProduct", 'String[]'>
    readonly active: FieldRef<"CachedProduct", 'Boolean'>
    readonly syncedAt: FieldRef<"CachedProduct", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CachedProduct findUnique
   */
  export type CachedProductFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedProduct
     */
    select?: CachedProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedProduct
     */
    omit?: CachedProductOmit<ExtArgs> | null
    /**
     * Filter, which CachedProduct to fetch.
     */
    where: CachedProductWhereUniqueInput
  }

  /**
   * CachedProduct findUniqueOrThrow
   */
  export type CachedProductFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedProduct
     */
    select?: CachedProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedProduct
     */
    omit?: CachedProductOmit<ExtArgs> | null
    /**
     * Filter, which CachedProduct to fetch.
     */
    where: CachedProductWhereUniqueInput
  }

  /**
   * CachedProduct findFirst
   */
  export type CachedProductFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedProduct
     */
    select?: CachedProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedProduct
     */
    omit?: CachedProductOmit<ExtArgs> | null
    /**
     * Filter, which CachedProduct to fetch.
     */
    where?: CachedProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CachedProducts to fetch.
     */
    orderBy?: CachedProductOrderByWithRelationInput | CachedProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CachedProducts.
     */
    cursor?: CachedProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CachedProducts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CachedProducts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CachedProducts.
     */
    distinct?: CachedProductScalarFieldEnum | CachedProductScalarFieldEnum[]
  }

  /**
   * CachedProduct findFirstOrThrow
   */
  export type CachedProductFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedProduct
     */
    select?: CachedProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedProduct
     */
    omit?: CachedProductOmit<ExtArgs> | null
    /**
     * Filter, which CachedProduct to fetch.
     */
    where?: CachedProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CachedProducts to fetch.
     */
    orderBy?: CachedProductOrderByWithRelationInput | CachedProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CachedProducts.
     */
    cursor?: CachedProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CachedProducts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CachedProducts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CachedProducts.
     */
    distinct?: CachedProductScalarFieldEnum | CachedProductScalarFieldEnum[]
  }

  /**
   * CachedProduct findMany
   */
  export type CachedProductFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedProduct
     */
    select?: CachedProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedProduct
     */
    omit?: CachedProductOmit<ExtArgs> | null
    /**
     * Filter, which CachedProducts to fetch.
     */
    where?: CachedProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CachedProducts to fetch.
     */
    orderBy?: CachedProductOrderByWithRelationInput | CachedProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CachedProducts.
     */
    cursor?: CachedProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CachedProducts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CachedProducts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CachedProducts.
     */
    distinct?: CachedProductScalarFieldEnum | CachedProductScalarFieldEnum[]
  }

  /**
   * CachedProduct create
   */
  export type CachedProductCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedProduct
     */
    select?: CachedProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedProduct
     */
    omit?: CachedProductOmit<ExtArgs> | null
    /**
     * The data needed to create a CachedProduct.
     */
    data: XOR<CachedProductCreateInput, CachedProductUncheckedCreateInput>
  }

  /**
   * CachedProduct createMany
   */
  export type CachedProductCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CachedProducts.
     */
    data: CachedProductCreateManyInput | CachedProductCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CachedProduct createManyAndReturn
   */
  export type CachedProductCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedProduct
     */
    select?: CachedProductSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CachedProduct
     */
    omit?: CachedProductOmit<ExtArgs> | null
    /**
     * The data used to create many CachedProducts.
     */
    data: CachedProductCreateManyInput | CachedProductCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CachedProduct update
   */
  export type CachedProductUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedProduct
     */
    select?: CachedProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedProduct
     */
    omit?: CachedProductOmit<ExtArgs> | null
    /**
     * The data needed to update a CachedProduct.
     */
    data: XOR<CachedProductUpdateInput, CachedProductUncheckedUpdateInput>
    /**
     * Choose, which CachedProduct to update.
     */
    where: CachedProductWhereUniqueInput
  }

  /**
   * CachedProduct updateMany
   */
  export type CachedProductUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CachedProducts.
     */
    data: XOR<CachedProductUpdateManyMutationInput, CachedProductUncheckedUpdateManyInput>
    /**
     * Filter which CachedProducts to update
     */
    where?: CachedProductWhereInput
    /**
     * Limit how many CachedProducts to update.
     */
    limit?: number
  }

  /**
   * CachedProduct updateManyAndReturn
   */
  export type CachedProductUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedProduct
     */
    select?: CachedProductSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CachedProduct
     */
    omit?: CachedProductOmit<ExtArgs> | null
    /**
     * The data used to update CachedProducts.
     */
    data: XOR<CachedProductUpdateManyMutationInput, CachedProductUncheckedUpdateManyInput>
    /**
     * Filter which CachedProducts to update
     */
    where?: CachedProductWhereInput
    /**
     * Limit how many CachedProducts to update.
     */
    limit?: number
  }

  /**
   * CachedProduct upsert
   */
  export type CachedProductUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedProduct
     */
    select?: CachedProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedProduct
     */
    omit?: CachedProductOmit<ExtArgs> | null
    /**
     * The filter to search for the CachedProduct to update in case it exists.
     */
    where: CachedProductWhereUniqueInput
    /**
     * In case the CachedProduct found by the `where` argument doesn't exist, create a new CachedProduct with this data.
     */
    create: XOR<CachedProductCreateInput, CachedProductUncheckedCreateInput>
    /**
     * In case the CachedProduct was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CachedProductUpdateInput, CachedProductUncheckedUpdateInput>
  }

  /**
   * CachedProduct delete
   */
  export type CachedProductDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedProduct
     */
    select?: CachedProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedProduct
     */
    omit?: CachedProductOmit<ExtArgs> | null
    /**
     * Filter which CachedProduct to delete.
     */
    where: CachedProductWhereUniqueInput
  }

  /**
   * CachedProduct deleteMany
   */
  export type CachedProductDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CachedProducts to delete
     */
    where?: CachedProductWhereInput
    /**
     * Limit how many CachedProducts to delete.
     */
    limit?: number
  }

  /**
   * CachedProduct without action
   */
  export type CachedProductDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CachedProduct
     */
    select?: CachedProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CachedProduct
     */
    omit?: CachedProductOmit<ExtArgs> | null
  }


  /**
   * Model Payment
   */

  export type AggregatePayment = {
    _count: PaymentCountAggregateOutputType | null
    _avg: PaymentAvgAggregateOutputType | null
    _sum: PaymentSumAggregateOutputType | null
    _min: PaymentMinAggregateOutputType | null
    _max: PaymentMaxAggregateOutputType | null
  }

  export type PaymentAvgAggregateOutputType = {
    id: number | null
    orderId: number | null
    amount: number | null
  }

  export type PaymentSumAggregateOutputType = {
    id: number | null
    orderId: number | null
    amount: number | null
  }

  export type PaymentMinAggregateOutputType = {
    id: number | null
    referenceId: string | null
    storeSlug: string | null
    orderId: number | null
    buyerRef: string | null
    amount: number | null
    currency: string | null
    provider: string | null
    status: string | null
    paymentUrl: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PaymentMaxAggregateOutputType = {
    id: number | null
    referenceId: string | null
    storeSlug: string | null
    orderId: number | null
    buyerRef: string | null
    amount: number | null
    currency: string | null
    provider: string | null
    status: string | null
    paymentUrl: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PaymentCountAggregateOutputType = {
    id: number
    referenceId: number
    storeSlug: number
    orderId: number
    buyerRef: number
    amount: number
    currency: number
    provider: number
    status: number
    paymentUrl: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PaymentAvgAggregateInputType = {
    id?: true
    orderId?: true
    amount?: true
  }

  export type PaymentSumAggregateInputType = {
    id?: true
    orderId?: true
    amount?: true
  }

  export type PaymentMinAggregateInputType = {
    id?: true
    referenceId?: true
    storeSlug?: true
    orderId?: true
    buyerRef?: true
    amount?: true
    currency?: true
    provider?: true
    status?: true
    paymentUrl?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PaymentMaxAggregateInputType = {
    id?: true
    referenceId?: true
    storeSlug?: true
    orderId?: true
    buyerRef?: true
    amount?: true
    currency?: true
    provider?: true
    status?: true
    paymentUrl?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PaymentCountAggregateInputType = {
    id?: true
    referenceId?: true
    storeSlug?: true
    orderId?: true
    buyerRef?: true
    amount?: true
    currency?: true
    provider?: true
    status?: true
    paymentUrl?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PaymentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Payment to aggregate.
     */
    where?: PaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Payments to fetch.
     */
    orderBy?: PaymentOrderByWithRelationInput | PaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Payments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Payments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Payments
    **/
    _count?: true | PaymentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PaymentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PaymentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PaymentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PaymentMaxAggregateInputType
  }

  export type GetPaymentAggregateType<T extends PaymentAggregateArgs> = {
        [P in keyof T & keyof AggregatePayment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePayment[P]>
      : GetScalarType<T[P], AggregatePayment[P]>
  }




  export type PaymentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PaymentWhereInput
    orderBy?: PaymentOrderByWithAggregationInput | PaymentOrderByWithAggregationInput[]
    by: PaymentScalarFieldEnum[] | PaymentScalarFieldEnum
    having?: PaymentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PaymentCountAggregateInputType | true
    _avg?: PaymentAvgAggregateInputType
    _sum?: PaymentSumAggregateInputType
    _min?: PaymentMinAggregateInputType
    _max?: PaymentMaxAggregateInputType
  }

  export type PaymentGroupByOutputType = {
    id: number
    referenceId: string
    storeSlug: string
    orderId: number
    buyerRef: string
    amount: number
    currency: string
    provider: string
    status: string
    paymentUrl: string | null
    createdAt: Date
    updatedAt: Date
    _count: PaymentCountAggregateOutputType | null
    _avg: PaymentAvgAggregateOutputType | null
    _sum: PaymentSumAggregateOutputType | null
    _min: PaymentMinAggregateOutputType | null
    _max: PaymentMaxAggregateOutputType | null
  }

  type GetPaymentGroupByPayload<T extends PaymentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PaymentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PaymentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PaymentGroupByOutputType[P]>
            : GetScalarType<T[P], PaymentGroupByOutputType[P]>
        }
      >
    >


  export type PaymentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    referenceId?: boolean
    storeSlug?: boolean
    orderId?: boolean
    buyerRef?: boolean
    amount?: boolean
    currency?: boolean
    provider?: boolean
    status?: boolean
    paymentUrl?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["payment"]>

  export type PaymentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    referenceId?: boolean
    storeSlug?: boolean
    orderId?: boolean
    buyerRef?: boolean
    amount?: boolean
    currency?: boolean
    provider?: boolean
    status?: boolean
    paymentUrl?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["payment"]>

  export type PaymentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    referenceId?: boolean
    storeSlug?: boolean
    orderId?: boolean
    buyerRef?: boolean
    amount?: boolean
    currency?: boolean
    provider?: boolean
    status?: boolean
    paymentUrl?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["payment"]>

  export type PaymentSelectScalar = {
    id?: boolean
    referenceId?: boolean
    storeSlug?: boolean
    orderId?: boolean
    buyerRef?: boolean
    amount?: boolean
    currency?: boolean
    provider?: boolean
    status?: boolean
    paymentUrl?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PaymentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "referenceId" | "storeSlug" | "orderId" | "buyerRef" | "amount" | "currency" | "provider" | "status" | "paymentUrl" | "createdAt" | "updatedAt", ExtArgs["result"]["payment"]>

  export type $PaymentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Payment"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      referenceId: string
      storeSlug: string
      orderId: number
      buyerRef: string
      amount: number
      currency: string
      provider: string
      status: string
      paymentUrl: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["payment"]>
    composites: {}
  }

  type PaymentGetPayload<S extends boolean | null | undefined | PaymentDefaultArgs> = $Result.GetResult<Prisma.$PaymentPayload, S>

  type PaymentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PaymentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PaymentCountAggregateInputType | true
    }

  export interface PaymentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Payment'], meta: { name: 'Payment' } }
    /**
     * Find zero or one Payment that matches the filter.
     * @param {PaymentFindUniqueArgs} args - Arguments to find a Payment
     * @example
     * // Get one Payment
     * const payment = await prisma.payment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PaymentFindUniqueArgs>(args: SelectSubset<T, PaymentFindUniqueArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Payment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PaymentFindUniqueOrThrowArgs} args - Arguments to find a Payment
     * @example
     * // Get one Payment
     * const payment = await prisma.payment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PaymentFindUniqueOrThrowArgs>(args: SelectSubset<T, PaymentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Payment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentFindFirstArgs} args - Arguments to find a Payment
     * @example
     * // Get one Payment
     * const payment = await prisma.payment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PaymentFindFirstArgs>(args?: SelectSubset<T, PaymentFindFirstArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Payment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentFindFirstOrThrowArgs} args - Arguments to find a Payment
     * @example
     * // Get one Payment
     * const payment = await prisma.payment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PaymentFindFirstOrThrowArgs>(args?: SelectSubset<T, PaymentFindFirstOrThrowArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Payments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Payments
     * const payments = await prisma.payment.findMany()
     * 
     * // Get first 10 Payments
     * const payments = await prisma.payment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const paymentWithIdOnly = await prisma.payment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PaymentFindManyArgs>(args?: SelectSubset<T, PaymentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Payment.
     * @param {PaymentCreateArgs} args - Arguments to create a Payment.
     * @example
     * // Create one Payment
     * const Payment = await prisma.payment.create({
     *   data: {
     *     // ... data to create a Payment
     *   }
     * })
     * 
     */
    create<T extends PaymentCreateArgs>(args: SelectSubset<T, PaymentCreateArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Payments.
     * @param {PaymentCreateManyArgs} args - Arguments to create many Payments.
     * @example
     * // Create many Payments
     * const payment = await prisma.payment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PaymentCreateManyArgs>(args?: SelectSubset<T, PaymentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Payments and returns the data saved in the database.
     * @param {PaymentCreateManyAndReturnArgs} args - Arguments to create many Payments.
     * @example
     * // Create many Payments
     * const payment = await prisma.payment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Payments and only return the `id`
     * const paymentWithIdOnly = await prisma.payment.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PaymentCreateManyAndReturnArgs>(args?: SelectSubset<T, PaymentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Payment.
     * @param {PaymentDeleteArgs} args - Arguments to delete one Payment.
     * @example
     * // Delete one Payment
     * const Payment = await prisma.payment.delete({
     *   where: {
     *     // ... filter to delete one Payment
     *   }
     * })
     * 
     */
    delete<T extends PaymentDeleteArgs>(args: SelectSubset<T, PaymentDeleteArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Payment.
     * @param {PaymentUpdateArgs} args - Arguments to update one Payment.
     * @example
     * // Update one Payment
     * const payment = await prisma.payment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PaymentUpdateArgs>(args: SelectSubset<T, PaymentUpdateArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Payments.
     * @param {PaymentDeleteManyArgs} args - Arguments to filter Payments to delete.
     * @example
     * // Delete a few Payments
     * const { count } = await prisma.payment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PaymentDeleteManyArgs>(args?: SelectSubset<T, PaymentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Payments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Payments
     * const payment = await prisma.payment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PaymentUpdateManyArgs>(args: SelectSubset<T, PaymentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Payments and returns the data updated in the database.
     * @param {PaymentUpdateManyAndReturnArgs} args - Arguments to update many Payments.
     * @example
     * // Update many Payments
     * const payment = await prisma.payment.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Payments and only return the `id`
     * const paymentWithIdOnly = await prisma.payment.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PaymentUpdateManyAndReturnArgs>(args: SelectSubset<T, PaymentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Payment.
     * @param {PaymentUpsertArgs} args - Arguments to update or create a Payment.
     * @example
     * // Update or create a Payment
     * const payment = await prisma.payment.upsert({
     *   create: {
     *     // ... data to create a Payment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Payment we want to update
     *   }
     * })
     */
    upsert<T extends PaymentUpsertArgs>(args: SelectSubset<T, PaymentUpsertArgs<ExtArgs>>): Prisma__PaymentClient<$Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Payments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentCountArgs} args - Arguments to filter Payments to count.
     * @example
     * // Count the number of Payments
     * const count = await prisma.payment.count({
     *   where: {
     *     // ... the filter for the Payments we want to count
     *   }
     * })
    **/
    count<T extends PaymentCountArgs>(
      args?: Subset<T, PaymentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PaymentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Payment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PaymentAggregateArgs>(args: Subset<T, PaymentAggregateArgs>): Prisma.PrismaPromise<GetPaymentAggregateType<T>>

    /**
     * Group by Payment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaymentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PaymentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PaymentGroupByArgs['orderBy'] }
        : { orderBy?: PaymentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PaymentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPaymentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Payment model
   */
  readonly fields: PaymentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Payment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PaymentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Payment model
   */
  interface PaymentFieldRefs {
    readonly id: FieldRef<"Payment", 'Int'>
    readonly referenceId: FieldRef<"Payment", 'String'>
    readonly storeSlug: FieldRef<"Payment", 'String'>
    readonly orderId: FieldRef<"Payment", 'Int'>
    readonly buyerRef: FieldRef<"Payment", 'String'>
    readonly amount: FieldRef<"Payment", 'Float'>
    readonly currency: FieldRef<"Payment", 'String'>
    readonly provider: FieldRef<"Payment", 'String'>
    readonly status: FieldRef<"Payment", 'String'>
    readonly paymentUrl: FieldRef<"Payment", 'String'>
    readonly createdAt: FieldRef<"Payment", 'DateTime'>
    readonly updatedAt: FieldRef<"Payment", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Payment findUnique
   */
  export type PaymentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Filter, which Payment to fetch.
     */
    where: PaymentWhereUniqueInput
  }

  /**
   * Payment findUniqueOrThrow
   */
  export type PaymentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Filter, which Payment to fetch.
     */
    where: PaymentWhereUniqueInput
  }

  /**
   * Payment findFirst
   */
  export type PaymentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Filter, which Payment to fetch.
     */
    where?: PaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Payments to fetch.
     */
    orderBy?: PaymentOrderByWithRelationInput | PaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Payments.
     */
    cursor?: PaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Payments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Payments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Payments.
     */
    distinct?: PaymentScalarFieldEnum | PaymentScalarFieldEnum[]
  }

  /**
   * Payment findFirstOrThrow
   */
  export type PaymentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Filter, which Payment to fetch.
     */
    where?: PaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Payments to fetch.
     */
    orderBy?: PaymentOrderByWithRelationInput | PaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Payments.
     */
    cursor?: PaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Payments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Payments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Payments.
     */
    distinct?: PaymentScalarFieldEnum | PaymentScalarFieldEnum[]
  }

  /**
   * Payment findMany
   */
  export type PaymentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Filter, which Payments to fetch.
     */
    where?: PaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Payments to fetch.
     */
    orderBy?: PaymentOrderByWithRelationInput | PaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Payments.
     */
    cursor?: PaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Payments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Payments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Payments.
     */
    distinct?: PaymentScalarFieldEnum | PaymentScalarFieldEnum[]
  }

  /**
   * Payment create
   */
  export type PaymentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * The data needed to create a Payment.
     */
    data: XOR<PaymentCreateInput, PaymentUncheckedCreateInput>
  }

  /**
   * Payment createMany
   */
  export type PaymentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Payments.
     */
    data: PaymentCreateManyInput | PaymentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Payment createManyAndReturn
   */
  export type PaymentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * The data used to create many Payments.
     */
    data: PaymentCreateManyInput | PaymentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Payment update
   */
  export type PaymentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * The data needed to update a Payment.
     */
    data: XOR<PaymentUpdateInput, PaymentUncheckedUpdateInput>
    /**
     * Choose, which Payment to update.
     */
    where: PaymentWhereUniqueInput
  }

  /**
   * Payment updateMany
   */
  export type PaymentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Payments.
     */
    data: XOR<PaymentUpdateManyMutationInput, PaymentUncheckedUpdateManyInput>
    /**
     * Filter which Payments to update
     */
    where?: PaymentWhereInput
    /**
     * Limit how many Payments to update.
     */
    limit?: number
  }

  /**
   * Payment updateManyAndReturn
   */
  export type PaymentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * The data used to update Payments.
     */
    data: XOR<PaymentUpdateManyMutationInput, PaymentUncheckedUpdateManyInput>
    /**
     * Filter which Payments to update
     */
    where?: PaymentWhereInput
    /**
     * Limit how many Payments to update.
     */
    limit?: number
  }

  /**
   * Payment upsert
   */
  export type PaymentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * The filter to search for the Payment to update in case it exists.
     */
    where: PaymentWhereUniqueInput
    /**
     * In case the Payment found by the `where` argument doesn't exist, create a new Payment with this data.
     */
    create: XOR<PaymentCreateInput, PaymentUncheckedCreateInput>
    /**
     * In case the Payment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PaymentUpdateInput, PaymentUncheckedUpdateInput>
  }

  /**
   * Payment delete
   */
  export type PaymentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
    /**
     * Filter which Payment to delete.
     */
    where: PaymentWhereUniqueInput
  }

  /**
   * Payment deleteMany
   */
  export type PaymentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Payments to delete
     */
    where?: PaymentWhereInput
    /**
     * Limit how many Payments to delete.
     */
    limit?: number
  }

  /**
   * Payment without action
   */
  export type PaymentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: PaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Payment
     */
    omit?: PaymentOmit<ExtArgs> | null
  }


  /**
   * Model Retailer
   */

  export type AggregateRetailer = {
    _count: RetailerCountAggregateOutputType | null
    _avg: RetailerAvgAggregateOutputType | null
    _sum: RetailerSumAggregateOutputType | null
    _min: RetailerMinAggregateOutputType | null
    _max: RetailerMaxAggregateOutputType | null
  }

  export type RetailerAvgAggregateOutputType = {
    id: number | null
  }

  export type RetailerSumAggregateOutputType = {
    id: number | null
  }

  export type RetailerMinAggregateOutputType = {
    id: number | null
    slug: string | null
    name: string | null
    contactEmail: string | null
    mcpServerUrl: string | null
    businessPermitUrl: string | null
    verified: boolean | null
    active: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    aiProvider: string | null
    aiApiKey: string | null
    aiModel: string | null
    aiSystemPrompt: string | null
    serperApiKey: string | null
    telegramNotifyChatId: string | null
    paymentProvider: string | null
    paymentApiKey: string | null
    paymentPublicKey: string | null
    paymentWebhookSecret: string | null
  }

  export type RetailerMaxAggregateOutputType = {
    id: number | null
    slug: string | null
    name: string | null
    contactEmail: string | null
    mcpServerUrl: string | null
    businessPermitUrl: string | null
    verified: boolean | null
    active: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    aiProvider: string | null
    aiApiKey: string | null
    aiModel: string | null
    aiSystemPrompt: string | null
    serperApiKey: string | null
    telegramNotifyChatId: string | null
    paymentProvider: string | null
    paymentApiKey: string | null
    paymentPublicKey: string | null
    paymentWebhookSecret: string | null
  }

  export type RetailerCountAggregateOutputType = {
    id: number
    slug: number
    name: number
    contactEmail: number
    mcpServerUrl: number
    businessPermitUrl: number
    verified: number
    active: number
    createdAt: number
    updatedAt: number
    aiProvider: number
    aiApiKey: number
    aiModel: number
    aiSystemPrompt: number
    serperApiKey: number
    telegramNotifyChatId: number
    paymentProvider: number
    paymentApiKey: number
    paymentPublicKey: number
    paymentWebhookSecret: number
    _all: number
  }


  export type RetailerAvgAggregateInputType = {
    id?: true
  }

  export type RetailerSumAggregateInputType = {
    id?: true
  }

  export type RetailerMinAggregateInputType = {
    id?: true
    slug?: true
    name?: true
    contactEmail?: true
    mcpServerUrl?: true
    businessPermitUrl?: true
    verified?: true
    active?: true
    createdAt?: true
    updatedAt?: true
    aiProvider?: true
    aiApiKey?: true
    aiModel?: true
    aiSystemPrompt?: true
    serperApiKey?: true
    telegramNotifyChatId?: true
    paymentProvider?: true
    paymentApiKey?: true
    paymentPublicKey?: true
    paymentWebhookSecret?: true
  }

  export type RetailerMaxAggregateInputType = {
    id?: true
    slug?: true
    name?: true
    contactEmail?: true
    mcpServerUrl?: true
    businessPermitUrl?: true
    verified?: true
    active?: true
    createdAt?: true
    updatedAt?: true
    aiProvider?: true
    aiApiKey?: true
    aiModel?: true
    aiSystemPrompt?: true
    serperApiKey?: true
    telegramNotifyChatId?: true
    paymentProvider?: true
    paymentApiKey?: true
    paymentPublicKey?: true
    paymentWebhookSecret?: true
  }

  export type RetailerCountAggregateInputType = {
    id?: true
    slug?: true
    name?: true
    contactEmail?: true
    mcpServerUrl?: true
    businessPermitUrl?: true
    verified?: true
    active?: true
    createdAt?: true
    updatedAt?: true
    aiProvider?: true
    aiApiKey?: true
    aiModel?: true
    aiSystemPrompt?: true
    serperApiKey?: true
    telegramNotifyChatId?: true
    paymentProvider?: true
    paymentApiKey?: true
    paymentPublicKey?: true
    paymentWebhookSecret?: true
    _all?: true
  }

  export type RetailerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Retailer to aggregate.
     */
    where?: RetailerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Retailers to fetch.
     */
    orderBy?: RetailerOrderByWithRelationInput | RetailerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RetailerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Retailers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Retailers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Retailers
    **/
    _count?: true | RetailerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RetailerAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RetailerSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RetailerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RetailerMaxAggregateInputType
  }

  export type GetRetailerAggregateType<T extends RetailerAggregateArgs> = {
        [P in keyof T & keyof AggregateRetailer]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRetailer[P]>
      : GetScalarType<T[P], AggregateRetailer[P]>
  }




  export type RetailerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RetailerWhereInput
    orderBy?: RetailerOrderByWithAggregationInput | RetailerOrderByWithAggregationInput[]
    by: RetailerScalarFieldEnum[] | RetailerScalarFieldEnum
    having?: RetailerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RetailerCountAggregateInputType | true
    _avg?: RetailerAvgAggregateInputType
    _sum?: RetailerSumAggregateInputType
    _min?: RetailerMinAggregateInputType
    _max?: RetailerMaxAggregateInputType
  }

  export type RetailerGroupByOutputType = {
    id: number
    slug: string
    name: string
    contactEmail: string
    mcpServerUrl: string
    businessPermitUrl: string | null
    verified: boolean
    active: boolean
    createdAt: Date
    updatedAt: Date
    aiProvider: string | null
    aiApiKey: string | null
    aiModel: string | null
    aiSystemPrompt: string | null
    serperApiKey: string | null
    telegramNotifyChatId: string | null
    paymentProvider: string | null
    paymentApiKey: string | null
    paymentPublicKey: string | null
    paymentWebhookSecret: string | null
    _count: RetailerCountAggregateOutputType | null
    _avg: RetailerAvgAggregateOutputType | null
    _sum: RetailerSumAggregateOutputType | null
    _min: RetailerMinAggregateOutputType | null
    _max: RetailerMaxAggregateOutputType | null
  }

  type GetRetailerGroupByPayload<T extends RetailerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RetailerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RetailerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RetailerGroupByOutputType[P]>
            : GetScalarType<T[P], RetailerGroupByOutputType[P]>
        }
      >
    >


  export type RetailerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slug?: boolean
    name?: boolean
    contactEmail?: boolean
    mcpServerUrl?: boolean
    businessPermitUrl?: boolean
    verified?: boolean
    active?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    aiProvider?: boolean
    aiApiKey?: boolean
    aiModel?: boolean
    aiSystemPrompt?: boolean
    serperApiKey?: boolean
    telegramNotifyChatId?: boolean
    paymentProvider?: boolean
    paymentApiKey?: boolean
    paymentPublicKey?: boolean
    paymentWebhookSecret?: boolean
    platformKey?: boolean | Retailer$platformKeyArgs<ExtArgs>
    auditLogs?: boolean | Retailer$auditLogsArgs<ExtArgs>
    _count?: boolean | RetailerCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["retailer"]>

  export type RetailerSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slug?: boolean
    name?: boolean
    contactEmail?: boolean
    mcpServerUrl?: boolean
    businessPermitUrl?: boolean
    verified?: boolean
    active?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    aiProvider?: boolean
    aiApiKey?: boolean
    aiModel?: boolean
    aiSystemPrompt?: boolean
    serperApiKey?: boolean
    telegramNotifyChatId?: boolean
    paymentProvider?: boolean
    paymentApiKey?: boolean
    paymentPublicKey?: boolean
    paymentWebhookSecret?: boolean
  }, ExtArgs["result"]["retailer"]>

  export type RetailerSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slug?: boolean
    name?: boolean
    contactEmail?: boolean
    mcpServerUrl?: boolean
    businessPermitUrl?: boolean
    verified?: boolean
    active?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    aiProvider?: boolean
    aiApiKey?: boolean
    aiModel?: boolean
    aiSystemPrompt?: boolean
    serperApiKey?: boolean
    telegramNotifyChatId?: boolean
    paymentProvider?: boolean
    paymentApiKey?: boolean
    paymentPublicKey?: boolean
    paymentWebhookSecret?: boolean
  }, ExtArgs["result"]["retailer"]>

  export type RetailerSelectScalar = {
    id?: boolean
    slug?: boolean
    name?: boolean
    contactEmail?: boolean
    mcpServerUrl?: boolean
    businessPermitUrl?: boolean
    verified?: boolean
    active?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    aiProvider?: boolean
    aiApiKey?: boolean
    aiModel?: boolean
    aiSystemPrompt?: boolean
    serperApiKey?: boolean
    telegramNotifyChatId?: boolean
    paymentProvider?: boolean
    paymentApiKey?: boolean
    paymentPublicKey?: boolean
    paymentWebhookSecret?: boolean
  }

  export type RetailerOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "slug" | "name" | "contactEmail" | "mcpServerUrl" | "businessPermitUrl" | "verified" | "active" | "createdAt" | "updatedAt" | "aiProvider" | "aiApiKey" | "aiModel" | "aiSystemPrompt" | "serperApiKey" | "telegramNotifyChatId" | "paymentProvider" | "paymentApiKey" | "paymentPublicKey" | "paymentWebhookSecret", ExtArgs["result"]["retailer"]>
  export type RetailerInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    platformKey?: boolean | Retailer$platformKeyArgs<ExtArgs>
    auditLogs?: boolean | Retailer$auditLogsArgs<ExtArgs>
    _count?: boolean | RetailerCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type RetailerIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type RetailerIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $RetailerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Retailer"
    objects: {
      platformKey: Prisma.$PlatformKeyPayload<ExtArgs> | null
      auditLogs: Prisma.$AuditLogPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      slug: string
      name: string
      contactEmail: string
      mcpServerUrl: string
      businessPermitUrl: string | null
      verified: boolean
      active: boolean
      createdAt: Date
      updatedAt: Date
      aiProvider: string | null
      aiApiKey: string | null
      aiModel: string | null
      aiSystemPrompt: string | null
      serperApiKey: string | null
      telegramNotifyChatId: string | null
      paymentProvider: string | null
      paymentApiKey: string | null
      paymentPublicKey: string | null
      paymentWebhookSecret: string | null
    }, ExtArgs["result"]["retailer"]>
    composites: {}
  }

  type RetailerGetPayload<S extends boolean | null | undefined | RetailerDefaultArgs> = $Result.GetResult<Prisma.$RetailerPayload, S>

  type RetailerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RetailerFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RetailerCountAggregateInputType | true
    }

  export interface RetailerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Retailer'], meta: { name: 'Retailer' } }
    /**
     * Find zero or one Retailer that matches the filter.
     * @param {RetailerFindUniqueArgs} args - Arguments to find a Retailer
     * @example
     * // Get one Retailer
     * const retailer = await prisma.retailer.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RetailerFindUniqueArgs>(args: SelectSubset<T, RetailerFindUniqueArgs<ExtArgs>>): Prisma__RetailerClient<$Result.GetResult<Prisma.$RetailerPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Retailer that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RetailerFindUniqueOrThrowArgs} args - Arguments to find a Retailer
     * @example
     * // Get one Retailer
     * const retailer = await prisma.retailer.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RetailerFindUniqueOrThrowArgs>(args: SelectSubset<T, RetailerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RetailerClient<$Result.GetResult<Prisma.$RetailerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Retailer that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RetailerFindFirstArgs} args - Arguments to find a Retailer
     * @example
     * // Get one Retailer
     * const retailer = await prisma.retailer.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RetailerFindFirstArgs>(args?: SelectSubset<T, RetailerFindFirstArgs<ExtArgs>>): Prisma__RetailerClient<$Result.GetResult<Prisma.$RetailerPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Retailer that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RetailerFindFirstOrThrowArgs} args - Arguments to find a Retailer
     * @example
     * // Get one Retailer
     * const retailer = await prisma.retailer.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RetailerFindFirstOrThrowArgs>(args?: SelectSubset<T, RetailerFindFirstOrThrowArgs<ExtArgs>>): Prisma__RetailerClient<$Result.GetResult<Prisma.$RetailerPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Retailers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RetailerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Retailers
     * const retailers = await prisma.retailer.findMany()
     * 
     * // Get first 10 Retailers
     * const retailers = await prisma.retailer.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const retailerWithIdOnly = await prisma.retailer.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RetailerFindManyArgs>(args?: SelectSubset<T, RetailerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RetailerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Retailer.
     * @param {RetailerCreateArgs} args - Arguments to create a Retailer.
     * @example
     * // Create one Retailer
     * const Retailer = await prisma.retailer.create({
     *   data: {
     *     // ... data to create a Retailer
     *   }
     * })
     * 
     */
    create<T extends RetailerCreateArgs>(args: SelectSubset<T, RetailerCreateArgs<ExtArgs>>): Prisma__RetailerClient<$Result.GetResult<Prisma.$RetailerPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Retailers.
     * @param {RetailerCreateManyArgs} args - Arguments to create many Retailers.
     * @example
     * // Create many Retailers
     * const retailer = await prisma.retailer.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RetailerCreateManyArgs>(args?: SelectSubset<T, RetailerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Retailers and returns the data saved in the database.
     * @param {RetailerCreateManyAndReturnArgs} args - Arguments to create many Retailers.
     * @example
     * // Create many Retailers
     * const retailer = await prisma.retailer.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Retailers and only return the `id`
     * const retailerWithIdOnly = await prisma.retailer.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RetailerCreateManyAndReturnArgs>(args?: SelectSubset<T, RetailerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RetailerPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Retailer.
     * @param {RetailerDeleteArgs} args - Arguments to delete one Retailer.
     * @example
     * // Delete one Retailer
     * const Retailer = await prisma.retailer.delete({
     *   where: {
     *     // ... filter to delete one Retailer
     *   }
     * })
     * 
     */
    delete<T extends RetailerDeleteArgs>(args: SelectSubset<T, RetailerDeleteArgs<ExtArgs>>): Prisma__RetailerClient<$Result.GetResult<Prisma.$RetailerPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Retailer.
     * @param {RetailerUpdateArgs} args - Arguments to update one Retailer.
     * @example
     * // Update one Retailer
     * const retailer = await prisma.retailer.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RetailerUpdateArgs>(args: SelectSubset<T, RetailerUpdateArgs<ExtArgs>>): Prisma__RetailerClient<$Result.GetResult<Prisma.$RetailerPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Retailers.
     * @param {RetailerDeleteManyArgs} args - Arguments to filter Retailers to delete.
     * @example
     * // Delete a few Retailers
     * const { count } = await prisma.retailer.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RetailerDeleteManyArgs>(args?: SelectSubset<T, RetailerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Retailers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RetailerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Retailers
     * const retailer = await prisma.retailer.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RetailerUpdateManyArgs>(args: SelectSubset<T, RetailerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Retailers and returns the data updated in the database.
     * @param {RetailerUpdateManyAndReturnArgs} args - Arguments to update many Retailers.
     * @example
     * // Update many Retailers
     * const retailer = await prisma.retailer.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Retailers and only return the `id`
     * const retailerWithIdOnly = await prisma.retailer.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RetailerUpdateManyAndReturnArgs>(args: SelectSubset<T, RetailerUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RetailerPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Retailer.
     * @param {RetailerUpsertArgs} args - Arguments to update or create a Retailer.
     * @example
     * // Update or create a Retailer
     * const retailer = await prisma.retailer.upsert({
     *   create: {
     *     // ... data to create a Retailer
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Retailer we want to update
     *   }
     * })
     */
    upsert<T extends RetailerUpsertArgs>(args: SelectSubset<T, RetailerUpsertArgs<ExtArgs>>): Prisma__RetailerClient<$Result.GetResult<Prisma.$RetailerPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Retailers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RetailerCountArgs} args - Arguments to filter Retailers to count.
     * @example
     * // Count the number of Retailers
     * const count = await prisma.retailer.count({
     *   where: {
     *     // ... the filter for the Retailers we want to count
     *   }
     * })
    **/
    count<T extends RetailerCountArgs>(
      args?: Subset<T, RetailerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RetailerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Retailer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RetailerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RetailerAggregateArgs>(args: Subset<T, RetailerAggregateArgs>): Prisma.PrismaPromise<GetRetailerAggregateType<T>>

    /**
     * Group by Retailer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RetailerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RetailerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RetailerGroupByArgs['orderBy'] }
        : { orderBy?: RetailerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RetailerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRetailerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Retailer model
   */
  readonly fields: RetailerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Retailer.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RetailerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    platformKey<T extends Retailer$platformKeyArgs<ExtArgs> = {}>(args?: Subset<T, Retailer$platformKeyArgs<ExtArgs>>): Prisma__PlatformKeyClient<$Result.GetResult<Prisma.$PlatformKeyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    auditLogs<T extends Retailer$auditLogsArgs<ExtArgs> = {}>(args?: Subset<T, Retailer$auditLogsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Retailer model
   */
  interface RetailerFieldRefs {
    readonly id: FieldRef<"Retailer", 'Int'>
    readonly slug: FieldRef<"Retailer", 'String'>
    readonly name: FieldRef<"Retailer", 'String'>
    readonly contactEmail: FieldRef<"Retailer", 'String'>
    readonly mcpServerUrl: FieldRef<"Retailer", 'String'>
    readonly businessPermitUrl: FieldRef<"Retailer", 'String'>
    readonly verified: FieldRef<"Retailer", 'Boolean'>
    readonly active: FieldRef<"Retailer", 'Boolean'>
    readonly createdAt: FieldRef<"Retailer", 'DateTime'>
    readonly updatedAt: FieldRef<"Retailer", 'DateTime'>
    readonly aiProvider: FieldRef<"Retailer", 'String'>
    readonly aiApiKey: FieldRef<"Retailer", 'String'>
    readonly aiModel: FieldRef<"Retailer", 'String'>
    readonly aiSystemPrompt: FieldRef<"Retailer", 'String'>
    readonly serperApiKey: FieldRef<"Retailer", 'String'>
    readonly telegramNotifyChatId: FieldRef<"Retailer", 'String'>
    readonly paymentProvider: FieldRef<"Retailer", 'String'>
    readonly paymentApiKey: FieldRef<"Retailer", 'String'>
    readonly paymentPublicKey: FieldRef<"Retailer", 'String'>
    readonly paymentWebhookSecret: FieldRef<"Retailer", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Retailer findUnique
   */
  export type RetailerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Retailer
     */
    select?: RetailerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Retailer
     */
    omit?: RetailerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RetailerInclude<ExtArgs> | null
    /**
     * Filter, which Retailer to fetch.
     */
    where: RetailerWhereUniqueInput
  }

  /**
   * Retailer findUniqueOrThrow
   */
  export type RetailerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Retailer
     */
    select?: RetailerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Retailer
     */
    omit?: RetailerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RetailerInclude<ExtArgs> | null
    /**
     * Filter, which Retailer to fetch.
     */
    where: RetailerWhereUniqueInput
  }

  /**
   * Retailer findFirst
   */
  export type RetailerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Retailer
     */
    select?: RetailerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Retailer
     */
    omit?: RetailerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RetailerInclude<ExtArgs> | null
    /**
     * Filter, which Retailer to fetch.
     */
    where?: RetailerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Retailers to fetch.
     */
    orderBy?: RetailerOrderByWithRelationInput | RetailerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Retailers.
     */
    cursor?: RetailerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Retailers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Retailers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Retailers.
     */
    distinct?: RetailerScalarFieldEnum | RetailerScalarFieldEnum[]
  }

  /**
   * Retailer findFirstOrThrow
   */
  export type RetailerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Retailer
     */
    select?: RetailerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Retailer
     */
    omit?: RetailerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RetailerInclude<ExtArgs> | null
    /**
     * Filter, which Retailer to fetch.
     */
    where?: RetailerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Retailers to fetch.
     */
    orderBy?: RetailerOrderByWithRelationInput | RetailerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Retailers.
     */
    cursor?: RetailerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Retailers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Retailers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Retailers.
     */
    distinct?: RetailerScalarFieldEnum | RetailerScalarFieldEnum[]
  }

  /**
   * Retailer findMany
   */
  export type RetailerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Retailer
     */
    select?: RetailerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Retailer
     */
    omit?: RetailerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RetailerInclude<ExtArgs> | null
    /**
     * Filter, which Retailers to fetch.
     */
    where?: RetailerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Retailers to fetch.
     */
    orderBy?: RetailerOrderByWithRelationInput | RetailerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Retailers.
     */
    cursor?: RetailerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Retailers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Retailers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Retailers.
     */
    distinct?: RetailerScalarFieldEnum | RetailerScalarFieldEnum[]
  }

  /**
   * Retailer create
   */
  export type RetailerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Retailer
     */
    select?: RetailerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Retailer
     */
    omit?: RetailerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RetailerInclude<ExtArgs> | null
    /**
     * The data needed to create a Retailer.
     */
    data: XOR<RetailerCreateInput, RetailerUncheckedCreateInput>
  }

  /**
   * Retailer createMany
   */
  export type RetailerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Retailers.
     */
    data: RetailerCreateManyInput | RetailerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Retailer createManyAndReturn
   */
  export type RetailerCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Retailer
     */
    select?: RetailerSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Retailer
     */
    omit?: RetailerOmit<ExtArgs> | null
    /**
     * The data used to create many Retailers.
     */
    data: RetailerCreateManyInput | RetailerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Retailer update
   */
  export type RetailerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Retailer
     */
    select?: RetailerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Retailer
     */
    omit?: RetailerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RetailerInclude<ExtArgs> | null
    /**
     * The data needed to update a Retailer.
     */
    data: XOR<RetailerUpdateInput, RetailerUncheckedUpdateInput>
    /**
     * Choose, which Retailer to update.
     */
    where: RetailerWhereUniqueInput
  }

  /**
   * Retailer updateMany
   */
  export type RetailerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Retailers.
     */
    data: XOR<RetailerUpdateManyMutationInput, RetailerUncheckedUpdateManyInput>
    /**
     * Filter which Retailers to update
     */
    where?: RetailerWhereInput
    /**
     * Limit how many Retailers to update.
     */
    limit?: number
  }

  /**
   * Retailer updateManyAndReturn
   */
  export type RetailerUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Retailer
     */
    select?: RetailerSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Retailer
     */
    omit?: RetailerOmit<ExtArgs> | null
    /**
     * The data used to update Retailers.
     */
    data: XOR<RetailerUpdateManyMutationInput, RetailerUncheckedUpdateManyInput>
    /**
     * Filter which Retailers to update
     */
    where?: RetailerWhereInput
    /**
     * Limit how many Retailers to update.
     */
    limit?: number
  }

  /**
   * Retailer upsert
   */
  export type RetailerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Retailer
     */
    select?: RetailerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Retailer
     */
    omit?: RetailerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RetailerInclude<ExtArgs> | null
    /**
     * The filter to search for the Retailer to update in case it exists.
     */
    where: RetailerWhereUniqueInput
    /**
     * In case the Retailer found by the `where` argument doesn't exist, create a new Retailer with this data.
     */
    create: XOR<RetailerCreateInput, RetailerUncheckedCreateInput>
    /**
     * In case the Retailer was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RetailerUpdateInput, RetailerUncheckedUpdateInput>
  }

  /**
   * Retailer delete
   */
  export type RetailerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Retailer
     */
    select?: RetailerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Retailer
     */
    omit?: RetailerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RetailerInclude<ExtArgs> | null
    /**
     * Filter which Retailer to delete.
     */
    where: RetailerWhereUniqueInput
  }

  /**
   * Retailer deleteMany
   */
  export type RetailerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Retailers to delete
     */
    where?: RetailerWhereInput
    /**
     * Limit how many Retailers to delete.
     */
    limit?: number
  }

  /**
   * Retailer.platformKey
   */
  export type Retailer$platformKeyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformKey
     */
    select?: PlatformKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformKey
     */
    omit?: PlatformKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlatformKeyInclude<ExtArgs> | null
    where?: PlatformKeyWhereInput
  }

  /**
   * Retailer.auditLogs
   */
  export type Retailer$auditLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    where?: AuditLogWhereInput
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    cursor?: AuditLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * Retailer without action
   */
  export type RetailerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Retailer
     */
    select?: RetailerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Retailer
     */
    omit?: RetailerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RetailerInclude<ExtArgs> | null
  }


  /**
   * Model PlatformKey
   */

  export type AggregatePlatformKey = {
    _count: PlatformKeyCountAggregateOutputType | null
    _avg: PlatformKeyAvgAggregateOutputType | null
    _sum: PlatformKeySumAggregateOutputType | null
    _min: PlatformKeyMinAggregateOutputType | null
    _max: PlatformKeyMaxAggregateOutputType | null
  }

  export type PlatformKeyAvgAggregateOutputType = {
    id: number | null
    retailerId: number | null
  }

  export type PlatformKeySumAggregateOutputType = {
    id: number | null
    retailerId: number | null
  }

  export type PlatformKeyMinAggregateOutputType = {
    id: number | null
    retailerId: number | null
    key: string | null
    issuedAt: Date | null
    revokedAt: Date | null
  }

  export type PlatformKeyMaxAggregateOutputType = {
    id: number | null
    retailerId: number | null
    key: string | null
    issuedAt: Date | null
    revokedAt: Date | null
  }

  export type PlatformKeyCountAggregateOutputType = {
    id: number
    retailerId: number
    key: number
    issuedAt: number
    revokedAt: number
    _all: number
  }


  export type PlatformKeyAvgAggregateInputType = {
    id?: true
    retailerId?: true
  }

  export type PlatformKeySumAggregateInputType = {
    id?: true
    retailerId?: true
  }

  export type PlatformKeyMinAggregateInputType = {
    id?: true
    retailerId?: true
    key?: true
    issuedAt?: true
    revokedAt?: true
  }

  export type PlatformKeyMaxAggregateInputType = {
    id?: true
    retailerId?: true
    key?: true
    issuedAt?: true
    revokedAt?: true
  }

  export type PlatformKeyCountAggregateInputType = {
    id?: true
    retailerId?: true
    key?: true
    issuedAt?: true
    revokedAt?: true
    _all?: true
  }

  export type PlatformKeyAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PlatformKey to aggregate.
     */
    where?: PlatformKeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlatformKeys to fetch.
     */
    orderBy?: PlatformKeyOrderByWithRelationInput | PlatformKeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PlatformKeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlatformKeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlatformKeys.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PlatformKeys
    **/
    _count?: true | PlatformKeyCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PlatformKeyAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PlatformKeySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PlatformKeyMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PlatformKeyMaxAggregateInputType
  }

  export type GetPlatformKeyAggregateType<T extends PlatformKeyAggregateArgs> = {
        [P in keyof T & keyof AggregatePlatformKey]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePlatformKey[P]>
      : GetScalarType<T[P], AggregatePlatformKey[P]>
  }




  export type PlatformKeyGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PlatformKeyWhereInput
    orderBy?: PlatformKeyOrderByWithAggregationInput | PlatformKeyOrderByWithAggregationInput[]
    by: PlatformKeyScalarFieldEnum[] | PlatformKeyScalarFieldEnum
    having?: PlatformKeyScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PlatformKeyCountAggregateInputType | true
    _avg?: PlatformKeyAvgAggregateInputType
    _sum?: PlatformKeySumAggregateInputType
    _min?: PlatformKeyMinAggregateInputType
    _max?: PlatformKeyMaxAggregateInputType
  }

  export type PlatformKeyGroupByOutputType = {
    id: number
    retailerId: number
    key: string
    issuedAt: Date
    revokedAt: Date | null
    _count: PlatformKeyCountAggregateOutputType | null
    _avg: PlatformKeyAvgAggregateOutputType | null
    _sum: PlatformKeySumAggregateOutputType | null
    _min: PlatformKeyMinAggregateOutputType | null
    _max: PlatformKeyMaxAggregateOutputType | null
  }

  type GetPlatformKeyGroupByPayload<T extends PlatformKeyGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PlatformKeyGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PlatformKeyGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PlatformKeyGroupByOutputType[P]>
            : GetScalarType<T[P], PlatformKeyGroupByOutputType[P]>
        }
      >
    >


  export type PlatformKeySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    retailerId?: boolean
    key?: boolean
    issuedAt?: boolean
    revokedAt?: boolean
    retailer?: boolean | RetailerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["platformKey"]>

  export type PlatformKeySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    retailerId?: boolean
    key?: boolean
    issuedAt?: boolean
    revokedAt?: boolean
    retailer?: boolean | RetailerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["platformKey"]>

  export type PlatformKeySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    retailerId?: boolean
    key?: boolean
    issuedAt?: boolean
    revokedAt?: boolean
    retailer?: boolean | RetailerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["platformKey"]>

  export type PlatformKeySelectScalar = {
    id?: boolean
    retailerId?: boolean
    key?: boolean
    issuedAt?: boolean
    revokedAt?: boolean
  }

  export type PlatformKeyOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "retailerId" | "key" | "issuedAt" | "revokedAt", ExtArgs["result"]["platformKey"]>
  export type PlatformKeyInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    retailer?: boolean | RetailerDefaultArgs<ExtArgs>
  }
  export type PlatformKeyIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    retailer?: boolean | RetailerDefaultArgs<ExtArgs>
  }
  export type PlatformKeyIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    retailer?: boolean | RetailerDefaultArgs<ExtArgs>
  }

  export type $PlatformKeyPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PlatformKey"
    objects: {
      retailer: Prisma.$RetailerPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      retailerId: number
      key: string
      issuedAt: Date
      revokedAt: Date | null
    }, ExtArgs["result"]["platformKey"]>
    composites: {}
  }

  type PlatformKeyGetPayload<S extends boolean | null | undefined | PlatformKeyDefaultArgs> = $Result.GetResult<Prisma.$PlatformKeyPayload, S>

  type PlatformKeyCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PlatformKeyFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PlatformKeyCountAggregateInputType | true
    }

  export interface PlatformKeyDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PlatformKey'], meta: { name: 'PlatformKey' } }
    /**
     * Find zero or one PlatformKey that matches the filter.
     * @param {PlatformKeyFindUniqueArgs} args - Arguments to find a PlatformKey
     * @example
     * // Get one PlatformKey
     * const platformKey = await prisma.platformKey.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PlatformKeyFindUniqueArgs>(args: SelectSubset<T, PlatformKeyFindUniqueArgs<ExtArgs>>): Prisma__PlatformKeyClient<$Result.GetResult<Prisma.$PlatformKeyPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PlatformKey that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PlatformKeyFindUniqueOrThrowArgs} args - Arguments to find a PlatformKey
     * @example
     * // Get one PlatformKey
     * const platformKey = await prisma.platformKey.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PlatformKeyFindUniqueOrThrowArgs>(args: SelectSubset<T, PlatformKeyFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PlatformKeyClient<$Result.GetResult<Prisma.$PlatformKeyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PlatformKey that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlatformKeyFindFirstArgs} args - Arguments to find a PlatformKey
     * @example
     * // Get one PlatformKey
     * const platformKey = await prisma.platformKey.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PlatformKeyFindFirstArgs>(args?: SelectSubset<T, PlatformKeyFindFirstArgs<ExtArgs>>): Prisma__PlatformKeyClient<$Result.GetResult<Prisma.$PlatformKeyPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PlatformKey that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlatformKeyFindFirstOrThrowArgs} args - Arguments to find a PlatformKey
     * @example
     * // Get one PlatformKey
     * const platformKey = await prisma.platformKey.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PlatformKeyFindFirstOrThrowArgs>(args?: SelectSubset<T, PlatformKeyFindFirstOrThrowArgs<ExtArgs>>): Prisma__PlatformKeyClient<$Result.GetResult<Prisma.$PlatformKeyPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PlatformKeys that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlatformKeyFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PlatformKeys
     * const platformKeys = await prisma.platformKey.findMany()
     * 
     * // Get first 10 PlatformKeys
     * const platformKeys = await prisma.platformKey.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const platformKeyWithIdOnly = await prisma.platformKey.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PlatformKeyFindManyArgs>(args?: SelectSubset<T, PlatformKeyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlatformKeyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PlatformKey.
     * @param {PlatformKeyCreateArgs} args - Arguments to create a PlatformKey.
     * @example
     * // Create one PlatformKey
     * const PlatformKey = await prisma.platformKey.create({
     *   data: {
     *     // ... data to create a PlatformKey
     *   }
     * })
     * 
     */
    create<T extends PlatformKeyCreateArgs>(args: SelectSubset<T, PlatformKeyCreateArgs<ExtArgs>>): Prisma__PlatformKeyClient<$Result.GetResult<Prisma.$PlatformKeyPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PlatformKeys.
     * @param {PlatformKeyCreateManyArgs} args - Arguments to create many PlatformKeys.
     * @example
     * // Create many PlatformKeys
     * const platformKey = await prisma.platformKey.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PlatformKeyCreateManyArgs>(args?: SelectSubset<T, PlatformKeyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PlatformKeys and returns the data saved in the database.
     * @param {PlatformKeyCreateManyAndReturnArgs} args - Arguments to create many PlatformKeys.
     * @example
     * // Create many PlatformKeys
     * const platformKey = await prisma.platformKey.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PlatformKeys and only return the `id`
     * const platformKeyWithIdOnly = await prisma.platformKey.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PlatformKeyCreateManyAndReturnArgs>(args?: SelectSubset<T, PlatformKeyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlatformKeyPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PlatformKey.
     * @param {PlatformKeyDeleteArgs} args - Arguments to delete one PlatformKey.
     * @example
     * // Delete one PlatformKey
     * const PlatformKey = await prisma.platformKey.delete({
     *   where: {
     *     // ... filter to delete one PlatformKey
     *   }
     * })
     * 
     */
    delete<T extends PlatformKeyDeleteArgs>(args: SelectSubset<T, PlatformKeyDeleteArgs<ExtArgs>>): Prisma__PlatformKeyClient<$Result.GetResult<Prisma.$PlatformKeyPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PlatformKey.
     * @param {PlatformKeyUpdateArgs} args - Arguments to update one PlatformKey.
     * @example
     * // Update one PlatformKey
     * const platformKey = await prisma.platformKey.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PlatformKeyUpdateArgs>(args: SelectSubset<T, PlatformKeyUpdateArgs<ExtArgs>>): Prisma__PlatformKeyClient<$Result.GetResult<Prisma.$PlatformKeyPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PlatformKeys.
     * @param {PlatformKeyDeleteManyArgs} args - Arguments to filter PlatformKeys to delete.
     * @example
     * // Delete a few PlatformKeys
     * const { count } = await prisma.platformKey.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PlatformKeyDeleteManyArgs>(args?: SelectSubset<T, PlatformKeyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PlatformKeys.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlatformKeyUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PlatformKeys
     * const platformKey = await prisma.platformKey.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PlatformKeyUpdateManyArgs>(args: SelectSubset<T, PlatformKeyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PlatformKeys and returns the data updated in the database.
     * @param {PlatformKeyUpdateManyAndReturnArgs} args - Arguments to update many PlatformKeys.
     * @example
     * // Update many PlatformKeys
     * const platformKey = await prisma.platformKey.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PlatformKeys and only return the `id`
     * const platformKeyWithIdOnly = await prisma.platformKey.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PlatformKeyUpdateManyAndReturnArgs>(args: SelectSubset<T, PlatformKeyUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlatformKeyPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PlatformKey.
     * @param {PlatformKeyUpsertArgs} args - Arguments to update or create a PlatformKey.
     * @example
     * // Update or create a PlatformKey
     * const platformKey = await prisma.platformKey.upsert({
     *   create: {
     *     // ... data to create a PlatformKey
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PlatformKey we want to update
     *   }
     * })
     */
    upsert<T extends PlatformKeyUpsertArgs>(args: SelectSubset<T, PlatformKeyUpsertArgs<ExtArgs>>): Prisma__PlatformKeyClient<$Result.GetResult<Prisma.$PlatformKeyPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PlatformKeys.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlatformKeyCountArgs} args - Arguments to filter PlatformKeys to count.
     * @example
     * // Count the number of PlatformKeys
     * const count = await prisma.platformKey.count({
     *   where: {
     *     // ... the filter for the PlatformKeys we want to count
     *   }
     * })
    **/
    count<T extends PlatformKeyCountArgs>(
      args?: Subset<T, PlatformKeyCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PlatformKeyCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PlatformKey.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlatformKeyAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PlatformKeyAggregateArgs>(args: Subset<T, PlatformKeyAggregateArgs>): Prisma.PrismaPromise<GetPlatformKeyAggregateType<T>>

    /**
     * Group by PlatformKey.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlatformKeyGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PlatformKeyGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PlatformKeyGroupByArgs['orderBy'] }
        : { orderBy?: PlatformKeyGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PlatformKeyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPlatformKeyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PlatformKey model
   */
  readonly fields: PlatformKeyFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PlatformKey.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PlatformKeyClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    retailer<T extends RetailerDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RetailerDefaultArgs<ExtArgs>>): Prisma__RetailerClient<$Result.GetResult<Prisma.$RetailerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PlatformKey model
   */
  interface PlatformKeyFieldRefs {
    readonly id: FieldRef<"PlatformKey", 'Int'>
    readonly retailerId: FieldRef<"PlatformKey", 'Int'>
    readonly key: FieldRef<"PlatformKey", 'String'>
    readonly issuedAt: FieldRef<"PlatformKey", 'DateTime'>
    readonly revokedAt: FieldRef<"PlatformKey", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PlatformKey findUnique
   */
  export type PlatformKeyFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformKey
     */
    select?: PlatformKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformKey
     */
    omit?: PlatformKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlatformKeyInclude<ExtArgs> | null
    /**
     * Filter, which PlatformKey to fetch.
     */
    where: PlatformKeyWhereUniqueInput
  }

  /**
   * PlatformKey findUniqueOrThrow
   */
  export type PlatformKeyFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformKey
     */
    select?: PlatformKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformKey
     */
    omit?: PlatformKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlatformKeyInclude<ExtArgs> | null
    /**
     * Filter, which PlatformKey to fetch.
     */
    where: PlatformKeyWhereUniqueInput
  }

  /**
   * PlatformKey findFirst
   */
  export type PlatformKeyFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformKey
     */
    select?: PlatformKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformKey
     */
    omit?: PlatformKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlatformKeyInclude<ExtArgs> | null
    /**
     * Filter, which PlatformKey to fetch.
     */
    where?: PlatformKeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlatformKeys to fetch.
     */
    orderBy?: PlatformKeyOrderByWithRelationInput | PlatformKeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PlatformKeys.
     */
    cursor?: PlatformKeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlatformKeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlatformKeys.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PlatformKeys.
     */
    distinct?: PlatformKeyScalarFieldEnum | PlatformKeyScalarFieldEnum[]
  }

  /**
   * PlatformKey findFirstOrThrow
   */
  export type PlatformKeyFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformKey
     */
    select?: PlatformKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformKey
     */
    omit?: PlatformKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlatformKeyInclude<ExtArgs> | null
    /**
     * Filter, which PlatformKey to fetch.
     */
    where?: PlatformKeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlatformKeys to fetch.
     */
    orderBy?: PlatformKeyOrderByWithRelationInput | PlatformKeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PlatformKeys.
     */
    cursor?: PlatformKeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlatformKeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlatformKeys.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PlatformKeys.
     */
    distinct?: PlatformKeyScalarFieldEnum | PlatformKeyScalarFieldEnum[]
  }

  /**
   * PlatformKey findMany
   */
  export type PlatformKeyFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformKey
     */
    select?: PlatformKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformKey
     */
    omit?: PlatformKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlatformKeyInclude<ExtArgs> | null
    /**
     * Filter, which PlatformKeys to fetch.
     */
    where?: PlatformKeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlatformKeys to fetch.
     */
    orderBy?: PlatformKeyOrderByWithRelationInput | PlatformKeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PlatformKeys.
     */
    cursor?: PlatformKeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlatformKeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlatformKeys.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PlatformKeys.
     */
    distinct?: PlatformKeyScalarFieldEnum | PlatformKeyScalarFieldEnum[]
  }

  /**
   * PlatformKey create
   */
  export type PlatformKeyCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformKey
     */
    select?: PlatformKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformKey
     */
    omit?: PlatformKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlatformKeyInclude<ExtArgs> | null
    /**
     * The data needed to create a PlatformKey.
     */
    data: XOR<PlatformKeyCreateInput, PlatformKeyUncheckedCreateInput>
  }

  /**
   * PlatformKey createMany
   */
  export type PlatformKeyCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PlatformKeys.
     */
    data: PlatformKeyCreateManyInput | PlatformKeyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PlatformKey createManyAndReturn
   */
  export type PlatformKeyCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformKey
     */
    select?: PlatformKeySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformKey
     */
    omit?: PlatformKeyOmit<ExtArgs> | null
    /**
     * The data used to create many PlatformKeys.
     */
    data: PlatformKeyCreateManyInput | PlatformKeyCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlatformKeyIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PlatformKey update
   */
  export type PlatformKeyUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformKey
     */
    select?: PlatformKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformKey
     */
    omit?: PlatformKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlatformKeyInclude<ExtArgs> | null
    /**
     * The data needed to update a PlatformKey.
     */
    data: XOR<PlatformKeyUpdateInput, PlatformKeyUncheckedUpdateInput>
    /**
     * Choose, which PlatformKey to update.
     */
    where: PlatformKeyWhereUniqueInput
  }

  /**
   * PlatformKey updateMany
   */
  export type PlatformKeyUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PlatformKeys.
     */
    data: XOR<PlatformKeyUpdateManyMutationInput, PlatformKeyUncheckedUpdateManyInput>
    /**
     * Filter which PlatformKeys to update
     */
    where?: PlatformKeyWhereInput
    /**
     * Limit how many PlatformKeys to update.
     */
    limit?: number
  }

  /**
   * PlatformKey updateManyAndReturn
   */
  export type PlatformKeyUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformKey
     */
    select?: PlatformKeySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformKey
     */
    omit?: PlatformKeyOmit<ExtArgs> | null
    /**
     * The data used to update PlatformKeys.
     */
    data: XOR<PlatformKeyUpdateManyMutationInput, PlatformKeyUncheckedUpdateManyInput>
    /**
     * Filter which PlatformKeys to update
     */
    where?: PlatformKeyWhereInput
    /**
     * Limit how many PlatformKeys to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlatformKeyIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * PlatformKey upsert
   */
  export type PlatformKeyUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformKey
     */
    select?: PlatformKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformKey
     */
    omit?: PlatformKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlatformKeyInclude<ExtArgs> | null
    /**
     * The filter to search for the PlatformKey to update in case it exists.
     */
    where: PlatformKeyWhereUniqueInput
    /**
     * In case the PlatformKey found by the `where` argument doesn't exist, create a new PlatformKey with this data.
     */
    create: XOR<PlatformKeyCreateInput, PlatformKeyUncheckedCreateInput>
    /**
     * In case the PlatformKey was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PlatformKeyUpdateInput, PlatformKeyUncheckedUpdateInput>
  }

  /**
   * PlatformKey delete
   */
  export type PlatformKeyDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformKey
     */
    select?: PlatformKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformKey
     */
    omit?: PlatformKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlatformKeyInclude<ExtArgs> | null
    /**
     * Filter which PlatformKey to delete.
     */
    where: PlatformKeyWhereUniqueInput
  }

  /**
   * PlatformKey deleteMany
   */
  export type PlatformKeyDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PlatformKeys to delete
     */
    where?: PlatformKeyWhereInput
    /**
     * Limit how many PlatformKeys to delete.
     */
    limit?: number
  }

  /**
   * PlatformKey without action
   */
  export type PlatformKeyDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformKey
     */
    select?: PlatformKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformKey
     */
    omit?: PlatformKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlatformKeyInclude<ExtArgs> | null
  }


  /**
   * Model AuditLog
   */

  export type AggregateAuditLog = {
    _count: AuditLogCountAggregateOutputType | null
    _avg: AuditLogAvgAggregateOutputType | null
    _sum: AuditLogSumAggregateOutputType | null
    _min: AuditLogMinAggregateOutputType | null
    _max: AuditLogMaxAggregateOutputType | null
  }

  export type AuditLogAvgAggregateOutputType = {
    id: number | null
    retailerId: number | null
  }

  export type AuditLogSumAggregateOutputType = {
    id: number | null
    retailerId: number | null
  }

  export type AuditLogMinAggregateOutputType = {
    id: number | null
    retailerId: number | null
    event: string | null
    createdAt: Date | null
  }

  export type AuditLogMaxAggregateOutputType = {
    id: number | null
    retailerId: number | null
    event: string | null
    createdAt: Date | null
  }

  export type AuditLogCountAggregateOutputType = {
    id: number
    retailerId: number
    event: number
    meta: number
    createdAt: number
    _all: number
  }


  export type AuditLogAvgAggregateInputType = {
    id?: true
    retailerId?: true
  }

  export type AuditLogSumAggregateInputType = {
    id?: true
    retailerId?: true
  }

  export type AuditLogMinAggregateInputType = {
    id?: true
    retailerId?: true
    event?: true
    createdAt?: true
  }

  export type AuditLogMaxAggregateInputType = {
    id?: true
    retailerId?: true
    event?: true
    createdAt?: true
  }

  export type AuditLogCountAggregateInputType = {
    id?: true
    retailerId?: true
    event?: true
    meta?: true
    createdAt?: true
    _all?: true
  }

  export type AuditLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLog to aggregate.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AuditLogs
    **/
    _count?: true | AuditLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AuditLogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AuditLogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AuditLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AuditLogMaxAggregateInputType
  }

  export type GetAuditLogAggregateType<T extends AuditLogAggregateArgs> = {
        [P in keyof T & keyof AggregateAuditLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuditLog[P]>
      : GetScalarType<T[P], AggregateAuditLog[P]>
  }




  export type AuditLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuditLogWhereInput
    orderBy?: AuditLogOrderByWithAggregationInput | AuditLogOrderByWithAggregationInput[]
    by: AuditLogScalarFieldEnum[] | AuditLogScalarFieldEnum
    having?: AuditLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AuditLogCountAggregateInputType | true
    _avg?: AuditLogAvgAggregateInputType
    _sum?: AuditLogSumAggregateInputType
    _min?: AuditLogMinAggregateInputType
    _max?: AuditLogMaxAggregateInputType
  }

  export type AuditLogGroupByOutputType = {
    id: number
    retailerId: number
    event: string
    meta: JsonValue | null
    createdAt: Date
    _count: AuditLogCountAggregateOutputType | null
    _avg: AuditLogAvgAggregateOutputType | null
    _sum: AuditLogSumAggregateOutputType | null
    _min: AuditLogMinAggregateOutputType | null
    _max: AuditLogMaxAggregateOutputType | null
  }

  type GetAuditLogGroupByPayload<T extends AuditLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AuditLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AuditLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
            : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
        }
      >
    >


  export type AuditLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    retailerId?: boolean
    event?: boolean
    meta?: boolean
    createdAt?: boolean
    retailer?: boolean | RetailerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["auditLog"]>

  export type AuditLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    retailerId?: boolean
    event?: boolean
    meta?: boolean
    createdAt?: boolean
    retailer?: boolean | RetailerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["auditLog"]>

  export type AuditLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    retailerId?: boolean
    event?: boolean
    meta?: boolean
    createdAt?: boolean
    retailer?: boolean | RetailerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["auditLog"]>

  export type AuditLogSelectScalar = {
    id?: boolean
    retailerId?: boolean
    event?: boolean
    meta?: boolean
    createdAt?: boolean
  }

  export type AuditLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "retailerId" | "event" | "meta" | "createdAt", ExtArgs["result"]["auditLog"]>
  export type AuditLogInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    retailer?: boolean | RetailerDefaultArgs<ExtArgs>
  }
  export type AuditLogIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    retailer?: boolean | RetailerDefaultArgs<ExtArgs>
  }
  export type AuditLogIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    retailer?: boolean | RetailerDefaultArgs<ExtArgs>
  }

  export type $AuditLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AuditLog"
    objects: {
      retailer: Prisma.$RetailerPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      retailerId: number
      event: string
      meta: Prisma.JsonValue | null
      createdAt: Date
    }, ExtArgs["result"]["auditLog"]>
    composites: {}
  }

  type AuditLogGetPayload<S extends boolean | null | undefined | AuditLogDefaultArgs> = $Result.GetResult<Prisma.$AuditLogPayload, S>

  type AuditLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AuditLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AuditLogCountAggregateInputType | true
    }

  export interface AuditLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AuditLog'], meta: { name: 'AuditLog' } }
    /**
     * Find zero or one AuditLog that matches the filter.
     * @param {AuditLogFindUniqueArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AuditLogFindUniqueArgs>(args: SelectSubset<T, AuditLogFindUniqueArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AuditLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AuditLogFindUniqueOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AuditLogFindUniqueOrThrowArgs>(args: SelectSubset<T, AuditLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuditLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AuditLogFindFirstArgs>(args?: SelectSubset<T, AuditLogFindFirstArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuditLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AuditLogFindFirstOrThrowArgs>(args?: SelectSubset<T, AuditLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AuditLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AuditLogs
     * const auditLogs = await prisma.auditLog.findMany()
     * 
     * // Get first 10 AuditLogs
     * const auditLogs = await prisma.auditLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AuditLogFindManyArgs>(args?: SelectSubset<T, AuditLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AuditLog.
     * @param {AuditLogCreateArgs} args - Arguments to create a AuditLog.
     * @example
     * // Create one AuditLog
     * const AuditLog = await prisma.auditLog.create({
     *   data: {
     *     // ... data to create a AuditLog
     *   }
     * })
     * 
     */
    create<T extends AuditLogCreateArgs>(args: SelectSubset<T, AuditLogCreateArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AuditLogs.
     * @param {AuditLogCreateManyArgs} args - Arguments to create many AuditLogs.
     * @example
     * // Create many AuditLogs
     * const auditLog = await prisma.auditLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AuditLogCreateManyArgs>(args?: SelectSubset<T, AuditLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AuditLogs and returns the data saved in the database.
     * @param {AuditLogCreateManyAndReturnArgs} args - Arguments to create many AuditLogs.
     * @example
     * // Create many AuditLogs
     * const auditLog = await prisma.auditLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AuditLogs and only return the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AuditLogCreateManyAndReturnArgs>(args?: SelectSubset<T, AuditLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AuditLog.
     * @param {AuditLogDeleteArgs} args - Arguments to delete one AuditLog.
     * @example
     * // Delete one AuditLog
     * const AuditLog = await prisma.auditLog.delete({
     *   where: {
     *     // ... filter to delete one AuditLog
     *   }
     * })
     * 
     */
    delete<T extends AuditLogDeleteArgs>(args: SelectSubset<T, AuditLogDeleteArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AuditLog.
     * @param {AuditLogUpdateArgs} args - Arguments to update one AuditLog.
     * @example
     * // Update one AuditLog
     * const auditLog = await prisma.auditLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AuditLogUpdateArgs>(args: SelectSubset<T, AuditLogUpdateArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AuditLogs.
     * @param {AuditLogDeleteManyArgs} args - Arguments to filter AuditLogs to delete.
     * @example
     * // Delete a few AuditLogs
     * const { count } = await prisma.auditLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AuditLogDeleteManyArgs>(args?: SelectSubset<T, AuditLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AuditLogs
     * const auditLog = await prisma.auditLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AuditLogUpdateManyArgs>(args: SelectSubset<T, AuditLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuditLogs and returns the data updated in the database.
     * @param {AuditLogUpdateManyAndReturnArgs} args - Arguments to update many AuditLogs.
     * @example
     * // Update many AuditLogs
     * const auditLog = await prisma.auditLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AuditLogs and only return the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AuditLogUpdateManyAndReturnArgs>(args: SelectSubset<T, AuditLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AuditLog.
     * @param {AuditLogUpsertArgs} args - Arguments to update or create a AuditLog.
     * @example
     * // Update or create a AuditLog
     * const auditLog = await prisma.auditLog.upsert({
     *   create: {
     *     // ... data to create a AuditLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AuditLog we want to update
     *   }
     * })
     */
    upsert<T extends AuditLogUpsertArgs>(args: SelectSubset<T, AuditLogUpsertArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogCountArgs} args - Arguments to filter AuditLogs to count.
     * @example
     * // Count the number of AuditLogs
     * const count = await prisma.auditLog.count({
     *   where: {
     *     // ... the filter for the AuditLogs we want to count
     *   }
     * })
    **/
    count<T extends AuditLogCountArgs>(
      args?: Subset<T, AuditLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AuditLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AuditLogAggregateArgs>(args: Subset<T, AuditLogAggregateArgs>): Prisma.PrismaPromise<GetAuditLogAggregateType<T>>

    /**
     * Group by AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AuditLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AuditLogGroupByArgs['orderBy'] }
        : { orderBy?: AuditLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AuditLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuditLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AuditLog model
   */
  readonly fields: AuditLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AuditLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AuditLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    retailer<T extends RetailerDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RetailerDefaultArgs<ExtArgs>>): Prisma__RetailerClient<$Result.GetResult<Prisma.$RetailerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AuditLog model
   */
  interface AuditLogFieldRefs {
    readonly id: FieldRef<"AuditLog", 'Int'>
    readonly retailerId: FieldRef<"AuditLog", 'Int'>
    readonly event: FieldRef<"AuditLog", 'String'>
    readonly meta: FieldRef<"AuditLog", 'Json'>
    readonly createdAt: FieldRef<"AuditLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AuditLog findUnique
   */
  export type AuditLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog findUniqueOrThrow
   */
  export type AuditLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog findFirst
   */
  export type AuditLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog findFirstOrThrow
   */
  export type AuditLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog findMany
   */
  export type AuditLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLogs to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog create
   */
  export type AuditLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * The data needed to create a AuditLog.
     */
    data: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>
  }

  /**
   * AuditLog createMany
   */
  export type AuditLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AuditLogs.
     */
    data: AuditLogCreateManyInput | AuditLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AuditLog createManyAndReturn
   */
  export type AuditLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * The data used to create many AuditLogs.
     */
    data: AuditLogCreateManyInput | AuditLogCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AuditLog update
   */
  export type AuditLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * The data needed to update a AuditLog.
     */
    data: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>
    /**
     * Choose, which AuditLog to update.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog updateMany
   */
  export type AuditLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AuditLogs.
     */
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyInput>
    /**
     * Filter which AuditLogs to update
     */
    where?: AuditLogWhereInput
    /**
     * Limit how many AuditLogs to update.
     */
    limit?: number
  }

  /**
   * AuditLog updateManyAndReturn
   */
  export type AuditLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * The data used to update AuditLogs.
     */
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyInput>
    /**
     * Filter which AuditLogs to update
     */
    where?: AuditLogWhereInput
    /**
     * Limit how many AuditLogs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * AuditLog upsert
   */
  export type AuditLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * The filter to search for the AuditLog to update in case it exists.
     */
    where: AuditLogWhereUniqueInput
    /**
     * In case the AuditLog found by the `where` argument doesn't exist, create a new AuditLog with this data.
     */
    create: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>
    /**
     * In case the AuditLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>
  }

  /**
   * AuditLog delete
   */
  export type AuditLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter which AuditLog to delete.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog deleteMany
   */
  export type AuditLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLogs to delete
     */
    where?: AuditLogWhereInput
    /**
     * Limit how many AuditLogs to delete.
     */
    limit?: number
  }

  /**
   * AuditLog without action
   */
  export type AuditLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
  }


  /**
   * Model Setting
   */

  export type AggregateSetting = {
    _count: SettingCountAggregateOutputType | null
    _min: SettingMinAggregateOutputType | null
    _max: SettingMaxAggregateOutputType | null
  }

  export type SettingMinAggregateOutputType = {
    key: string | null
    value: string | null
    updatedAt: Date | null
  }

  export type SettingMaxAggregateOutputType = {
    key: string | null
    value: string | null
    updatedAt: Date | null
  }

  export type SettingCountAggregateOutputType = {
    key: number
    value: number
    updatedAt: number
    _all: number
  }


  export type SettingMinAggregateInputType = {
    key?: true
    value?: true
    updatedAt?: true
  }

  export type SettingMaxAggregateInputType = {
    key?: true
    value?: true
    updatedAt?: true
  }

  export type SettingCountAggregateInputType = {
    key?: true
    value?: true
    updatedAt?: true
    _all?: true
  }

  export type SettingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Setting to aggregate.
     */
    where?: SettingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Settings to fetch.
     */
    orderBy?: SettingOrderByWithRelationInput | SettingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SettingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Settings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Settings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Settings
    **/
    _count?: true | SettingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SettingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SettingMaxAggregateInputType
  }

  export type GetSettingAggregateType<T extends SettingAggregateArgs> = {
        [P in keyof T & keyof AggregateSetting]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSetting[P]>
      : GetScalarType<T[P], AggregateSetting[P]>
  }




  export type SettingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SettingWhereInput
    orderBy?: SettingOrderByWithAggregationInput | SettingOrderByWithAggregationInput[]
    by: SettingScalarFieldEnum[] | SettingScalarFieldEnum
    having?: SettingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SettingCountAggregateInputType | true
    _min?: SettingMinAggregateInputType
    _max?: SettingMaxAggregateInputType
  }

  export type SettingGroupByOutputType = {
    key: string
    value: string
    updatedAt: Date
    _count: SettingCountAggregateOutputType | null
    _min: SettingMinAggregateOutputType | null
    _max: SettingMaxAggregateOutputType | null
  }

  type GetSettingGroupByPayload<T extends SettingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SettingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SettingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SettingGroupByOutputType[P]>
            : GetScalarType<T[P], SettingGroupByOutputType[P]>
        }
      >
    >


  export type SettingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    key?: boolean
    value?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["setting"]>

  export type SettingSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    key?: boolean
    value?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["setting"]>

  export type SettingSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    key?: boolean
    value?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["setting"]>

  export type SettingSelectScalar = {
    key?: boolean
    value?: boolean
    updatedAt?: boolean
  }

  export type SettingOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"key" | "value" | "updatedAt", ExtArgs["result"]["setting"]>

  export type $SettingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Setting"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      key: string
      value: string
      updatedAt: Date
    }, ExtArgs["result"]["setting"]>
    composites: {}
  }

  type SettingGetPayload<S extends boolean | null | undefined | SettingDefaultArgs> = $Result.GetResult<Prisma.$SettingPayload, S>

  type SettingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SettingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SettingCountAggregateInputType | true
    }

  export interface SettingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Setting'], meta: { name: 'Setting' } }
    /**
     * Find zero or one Setting that matches the filter.
     * @param {SettingFindUniqueArgs} args - Arguments to find a Setting
     * @example
     * // Get one Setting
     * const setting = await prisma.setting.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SettingFindUniqueArgs>(args: SelectSubset<T, SettingFindUniqueArgs<ExtArgs>>): Prisma__SettingClient<$Result.GetResult<Prisma.$SettingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Setting that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SettingFindUniqueOrThrowArgs} args - Arguments to find a Setting
     * @example
     * // Get one Setting
     * const setting = await prisma.setting.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SettingFindUniqueOrThrowArgs>(args: SelectSubset<T, SettingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SettingClient<$Result.GetResult<Prisma.$SettingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Setting that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingFindFirstArgs} args - Arguments to find a Setting
     * @example
     * // Get one Setting
     * const setting = await prisma.setting.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SettingFindFirstArgs>(args?: SelectSubset<T, SettingFindFirstArgs<ExtArgs>>): Prisma__SettingClient<$Result.GetResult<Prisma.$SettingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Setting that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingFindFirstOrThrowArgs} args - Arguments to find a Setting
     * @example
     * // Get one Setting
     * const setting = await prisma.setting.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SettingFindFirstOrThrowArgs>(args?: SelectSubset<T, SettingFindFirstOrThrowArgs<ExtArgs>>): Prisma__SettingClient<$Result.GetResult<Prisma.$SettingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Settings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Settings
     * const settings = await prisma.setting.findMany()
     * 
     * // Get first 10 Settings
     * const settings = await prisma.setting.findMany({ take: 10 })
     * 
     * // Only select the `key`
     * const settingWithKeyOnly = await prisma.setting.findMany({ select: { key: true } })
     * 
     */
    findMany<T extends SettingFindManyArgs>(args?: SelectSubset<T, SettingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SettingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Setting.
     * @param {SettingCreateArgs} args - Arguments to create a Setting.
     * @example
     * // Create one Setting
     * const Setting = await prisma.setting.create({
     *   data: {
     *     // ... data to create a Setting
     *   }
     * })
     * 
     */
    create<T extends SettingCreateArgs>(args: SelectSubset<T, SettingCreateArgs<ExtArgs>>): Prisma__SettingClient<$Result.GetResult<Prisma.$SettingPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Settings.
     * @param {SettingCreateManyArgs} args - Arguments to create many Settings.
     * @example
     * // Create many Settings
     * const setting = await prisma.setting.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SettingCreateManyArgs>(args?: SelectSubset<T, SettingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Settings and returns the data saved in the database.
     * @param {SettingCreateManyAndReturnArgs} args - Arguments to create many Settings.
     * @example
     * // Create many Settings
     * const setting = await prisma.setting.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Settings and only return the `key`
     * const settingWithKeyOnly = await prisma.setting.createManyAndReturn({
     *   select: { key: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SettingCreateManyAndReturnArgs>(args?: SelectSubset<T, SettingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SettingPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Setting.
     * @param {SettingDeleteArgs} args - Arguments to delete one Setting.
     * @example
     * // Delete one Setting
     * const Setting = await prisma.setting.delete({
     *   where: {
     *     // ... filter to delete one Setting
     *   }
     * })
     * 
     */
    delete<T extends SettingDeleteArgs>(args: SelectSubset<T, SettingDeleteArgs<ExtArgs>>): Prisma__SettingClient<$Result.GetResult<Prisma.$SettingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Setting.
     * @param {SettingUpdateArgs} args - Arguments to update one Setting.
     * @example
     * // Update one Setting
     * const setting = await prisma.setting.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SettingUpdateArgs>(args: SelectSubset<T, SettingUpdateArgs<ExtArgs>>): Prisma__SettingClient<$Result.GetResult<Prisma.$SettingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Settings.
     * @param {SettingDeleteManyArgs} args - Arguments to filter Settings to delete.
     * @example
     * // Delete a few Settings
     * const { count } = await prisma.setting.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SettingDeleteManyArgs>(args?: SelectSubset<T, SettingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Settings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Settings
     * const setting = await prisma.setting.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SettingUpdateManyArgs>(args: SelectSubset<T, SettingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Settings and returns the data updated in the database.
     * @param {SettingUpdateManyAndReturnArgs} args - Arguments to update many Settings.
     * @example
     * // Update many Settings
     * const setting = await prisma.setting.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Settings and only return the `key`
     * const settingWithKeyOnly = await prisma.setting.updateManyAndReturn({
     *   select: { key: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SettingUpdateManyAndReturnArgs>(args: SelectSubset<T, SettingUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SettingPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Setting.
     * @param {SettingUpsertArgs} args - Arguments to update or create a Setting.
     * @example
     * // Update or create a Setting
     * const setting = await prisma.setting.upsert({
     *   create: {
     *     // ... data to create a Setting
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Setting we want to update
     *   }
     * })
     */
    upsert<T extends SettingUpsertArgs>(args: SelectSubset<T, SettingUpsertArgs<ExtArgs>>): Prisma__SettingClient<$Result.GetResult<Prisma.$SettingPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Settings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingCountArgs} args - Arguments to filter Settings to count.
     * @example
     * // Count the number of Settings
     * const count = await prisma.setting.count({
     *   where: {
     *     // ... the filter for the Settings we want to count
     *   }
     * })
    **/
    count<T extends SettingCountArgs>(
      args?: Subset<T, SettingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SettingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Setting.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SettingAggregateArgs>(args: Subset<T, SettingAggregateArgs>): Prisma.PrismaPromise<GetSettingAggregateType<T>>

    /**
     * Group by Setting.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SettingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SettingGroupByArgs['orderBy'] }
        : { orderBy?: SettingGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SettingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSettingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Setting model
   */
  readonly fields: SettingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Setting.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SettingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Setting model
   */
  interface SettingFieldRefs {
    readonly key: FieldRef<"Setting", 'String'>
    readonly value: FieldRef<"Setting", 'String'>
    readonly updatedAt: FieldRef<"Setting", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Setting findUnique
   */
  export type SettingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Setting
     */
    select?: SettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Setting
     */
    omit?: SettingOmit<ExtArgs> | null
    /**
     * Filter, which Setting to fetch.
     */
    where: SettingWhereUniqueInput
  }

  /**
   * Setting findUniqueOrThrow
   */
  export type SettingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Setting
     */
    select?: SettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Setting
     */
    omit?: SettingOmit<ExtArgs> | null
    /**
     * Filter, which Setting to fetch.
     */
    where: SettingWhereUniqueInput
  }

  /**
   * Setting findFirst
   */
  export type SettingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Setting
     */
    select?: SettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Setting
     */
    omit?: SettingOmit<ExtArgs> | null
    /**
     * Filter, which Setting to fetch.
     */
    where?: SettingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Settings to fetch.
     */
    orderBy?: SettingOrderByWithRelationInput | SettingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Settings.
     */
    cursor?: SettingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Settings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Settings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Settings.
     */
    distinct?: SettingScalarFieldEnum | SettingScalarFieldEnum[]
  }

  /**
   * Setting findFirstOrThrow
   */
  export type SettingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Setting
     */
    select?: SettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Setting
     */
    omit?: SettingOmit<ExtArgs> | null
    /**
     * Filter, which Setting to fetch.
     */
    where?: SettingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Settings to fetch.
     */
    orderBy?: SettingOrderByWithRelationInput | SettingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Settings.
     */
    cursor?: SettingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Settings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Settings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Settings.
     */
    distinct?: SettingScalarFieldEnum | SettingScalarFieldEnum[]
  }

  /**
   * Setting findMany
   */
  export type SettingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Setting
     */
    select?: SettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Setting
     */
    omit?: SettingOmit<ExtArgs> | null
    /**
     * Filter, which Settings to fetch.
     */
    where?: SettingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Settings to fetch.
     */
    orderBy?: SettingOrderByWithRelationInput | SettingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Settings.
     */
    cursor?: SettingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Settings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Settings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Settings.
     */
    distinct?: SettingScalarFieldEnum | SettingScalarFieldEnum[]
  }

  /**
   * Setting create
   */
  export type SettingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Setting
     */
    select?: SettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Setting
     */
    omit?: SettingOmit<ExtArgs> | null
    /**
     * The data needed to create a Setting.
     */
    data: XOR<SettingCreateInput, SettingUncheckedCreateInput>
  }

  /**
   * Setting createMany
   */
  export type SettingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Settings.
     */
    data: SettingCreateManyInput | SettingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Setting createManyAndReturn
   */
  export type SettingCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Setting
     */
    select?: SettingSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Setting
     */
    omit?: SettingOmit<ExtArgs> | null
    /**
     * The data used to create many Settings.
     */
    data: SettingCreateManyInput | SettingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Setting update
   */
  export type SettingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Setting
     */
    select?: SettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Setting
     */
    omit?: SettingOmit<ExtArgs> | null
    /**
     * The data needed to update a Setting.
     */
    data: XOR<SettingUpdateInput, SettingUncheckedUpdateInput>
    /**
     * Choose, which Setting to update.
     */
    where: SettingWhereUniqueInput
  }

  /**
   * Setting updateMany
   */
  export type SettingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Settings.
     */
    data: XOR<SettingUpdateManyMutationInput, SettingUncheckedUpdateManyInput>
    /**
     * Filter which Settings to update
     */
    where?: SettingWhereInput
    /**
     * Limit how many Settings to update.
     */
    limit?: number
  }

  /**
   * Setting updateManyAndReturn
   */
  export type SettingUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Setting
     */
    select?: SettingSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Setting
     */
    omit?: SettingOmit<ExtArgs> | null
    /**
     * The data used to update Settings.
     */
    data: XOR<SettingUpdateManyMutationInput, SettingUncheckedUpdateManyInput>
    /**
     * Filter which Settings to update
     */
    where?: SettingWhereInput
    /**
     * Limit how many Settings to update.
     */
    limit?: number
  }

  /**
   * Setting upsert
   */
  export type SettingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Setting
     */
    select?: SettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Setting
     */
    omit?: SettingOmit<ExtArgs> | null
    /**
     * The filter to search for the Setting to update in case it exists.
     */
    where: SettingWhereUniqueInput
    /**
     * In case the Setting found by the `where` argument doesn't exist, create a new Setting with this data.
     */
    create: XOR<SettingCreateInput, SettingUncheckedCreateInput>
    /**
     * In case the Setting was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SettingUpdateInput, SettingUncheckedUpdateInput>
  }

  /**
   * Setting delete
   */
  export type SettingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Setting
     */
    select?: SettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Setting
     */
    omit?: SettingOmit<ExtArgs> | null
    /**
     * Filter which Setting to delete.
     */
    where: SettingWhereUniqueInput
  }

  /**
   * Setting deleteMany
   */
  export type SettingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Settings to delete
     */
    where?: SettingWhereInput
    /**
     * Limit how many Settings to delete.
     */
    limit?: number
  }

  /**
   * Setting without action
   */
  export type SettingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Setting
     */
    select?: SettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Setting
     */
    omit?: SettingOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const AdminUserScalarFieldEnum: {
    id: 'id',
    username: 'username',
    passwordHash: 'passwordHash',
    createdAt: 'createdAt'
  };

  export type AdminUserScalarFieldEnum = (typeof AdminUserScalarFieldEnum)[keyof typeof AdminUserScalarFieldEnum]


  export const CartScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    storeSlug: 'storeSlug',
    productId: 'productId',
    title: 'title',
    price: 'price',
    quantity: 'quantity',
    updatedAt: 'updatedAt'
  };

  export type CartScalarFieldEnum = (typeof CartScalarFieldEnum)[keyof typeof CartScalarFieldEnum]


  export const CachedCategoryScalarFieldEnum: {
    id: 'id',
    storeSlug: 'storeSlug',
    sellerId: 'sellerId',
    name: 'name',
    parentId: 'parentId',
    syncedAt: 'syncedAt'
  };

  export type CachedCategoryScalarFieldEnum = (typeof CachedCategoryScalarFieldEnum)[keyof typeof CachedCategoryScalarFieldEnum]


  export const CachedProductScalarFieldEnum: {
    id: 'id',
    storeSlug: 'storeSlug',
    sellerId: 'sellerId',
    title: 'title',
    description: 'description',
    sku: 'sku',
    price: 'price',
    stockQuantity: 'stockQuantity',
    categoryId: 'categoryId',
    tags: 'tags',
    images: 'images',
    active: 'active',
    syncedAt: 'syncedAt'
  };

  export type CachedProductScalarFieldEnum = (typeof CachedProductScalarFieldEnum)[keyof typeof CachedProductScalarFieldEnum]


  export const PaymentScalarFieldEnum: {
    id: 'id',
    referenceId: 'referenceId',
    storeSlug: 'storeSlug',
    orderId: 'orderId',
    buyerRef: 'buyerRef',
    amount: 'amount',
    currency: 'currency',
    provider: 'provider',
    status: 'status',
    paymentUrl: 'paymentUrl',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PaymentScalarFieldEnum = (typeof PaymentScalarFieldEnum)[keyof typeof PaymentScalarFieldEnum]


  export const RetailerScalarFieldEnum: {
    id: 'id',
    slug: 'slug',
    name: 'name',
    contactEmail: 'contactEmail',
    mcpServerUrl: 'mcpServerUrl',
    businessPermitUrl: 'businessPermitUrl',
    verified: 'verified',
    active: 'active',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    aiProvider: 'aiProvider',
    aiApiKey: 'aiApiKey',
    aiModel: 'aiModel',
    aiSystemPrompt: 'aiSystemPrompt',
    serperApiKey: 'serperApiKey',
    telegramNotifyChatId: 'telegramNotifyChatId',
    paymentProvider: 'paymentProvider',
    paymentApiKey: 'paymentApiKey',
    paymentPublicKey: 'paymentPublicKey',
    paymentWebhookSecret: 'paymentWebhookSecret'
  };

  export type RetailerScalarFieldEnum = (typeof RetailerScalarFieldEnum)[keyof typeof RetailerScalarFieldEnum]


  export const PlatformKeyScalarFieldEnum: {
    id: 'id',
    retailerId: 'retailerId',
    key: 'key',
    issuedAt: 'issuedAt',
    revokedAt: 'revokedAt'
  };

  export type PlatformKeyScalarFieldEnum = (typeof PlatformKeyScalarFieldEnum)[keyof typeof PlatformKeyScalarFieldEnum]


  export const AuditLogScalarFieldEnum: {
    id: 'id',
    retailerId: 'retailerId',
    event: 'event',
    meta: 'meta',
    createdAt: 'createdAt'
  };

  export type AuditLogScalarFieldEnum = (typeof AuditLogScalarFieldEnum)[keyof typeof AuditLogScalarFieldEnum]


  export const SettingScalarFieldEnum: {
    key: 'key',
    value: 'value',
    updatedAt: 'updatedAt'
  };

  export type SettingScalarFieldEnum = (typeof SettingScalarFieldEnum)[keyof typeof SettingScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    
  /**
   * Deep Input Types
   */


  export type AdminUserWhereInput = {
    AND?: AdminUserWhereInput | AdminUserWhereInput[]
    OR?: AdminUserWhereInput[]
    NOT?: AdminUserWhereInput | AdminUserWhereInput[]
    id?: IntFilter<"AdminUser"> | number
    username?: StringFilter<"AdminUser"> | string
    passwordHash?: StringFilter<"AdminUser"> | string
    createdAt?: DateTimeFilter<"AdminUser"> | Date | string
  }

  export type AdminUserOrderByWithRelationInput = {
    id?: SortOrder
    username?: SortOrder
    passwordHash?: SortOrder
    createdAt?: SortOrder
  }

  export type AdminUserWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    username?: string
    AND?: AdminUserWhereInput | AdminUserWhereInput[]
    OR?: AdminUserWhereInput[]
    NOT?: AdminUserWhereInput | AdminUserWhereInput[]
    passwordHash?: StringFilter<"AdminUser"> | string
    createdAt?: DateTimeFilter<"AdminUser"> | Date | string
  }, "id" | "username">

  export type AdminUserOrderByWithAggregationInput = {
    id?: SortOrder
    username?: SortOrder
    passwordHash?: SortOrder
    createdAt?: SortOrder
    _count?: AdminUserCountOrderByAggregateInput
    _avg?: AdminUserAvgOrderByAggregateInput
    _max?: AdminUserMaxOrderByAggregateInput
    _min?: AdminUserMinOrderByAggregateInput
    _sum?: AdminUserSumOrderByAggregateInput
  }

  export type AdminUserScalarWhereWithAggregatesInput = {
    AND?: AdminUserScalarWhereWithAggregatesInput | AdminUserScalarWhereWithAggregatesInput[]
    OR?: AdminUserScalarWhereWithAggregatesInput[]
    NOT?: AdminUserScalarWhereWithAggregatesInput | AdminUserScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"AdminUser"> | number
    username?: StringWithAggregatesFilter<"AdminUser"> | string
    passwordHash?: StringWithAggregatesFilter<"AdminUser"> | string
    createdAt?: DateTimeWithAggregatesFilter<"AdminUser"> | Date | string
  }

  export type CartWhereInput = {
    AND?: CartWhereInput | CartWhereInput[]
    OR?: CartWhereInput[]
    NOT?: CartWhereInput | CartWhereInput[]
    id?: IntFilter<"Cart"> | number
    userId?: StringFilter<"Cart"> | string
    storeSlug?: StringFilter<"Cart"> | string
    productId?: IntFilter<"Cart"> | number
    title?: StringFilter<"Cart"> | string
    price?: FloatFilter<"Cart"> | number
    quantity?: IntFilter<"Cart"> | number
    updatedAt?: DateTimeFilter<"Cart"> | Date | string
  }

  export type CartOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    storeSlug?: SortOrder
    productId?: SortOrder
    title?: SortOrder
    price?: SortOrder
    quantity?: SortOrder
    updatedAt?: SortOrder
  }

  export type CartWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    userId_storeSlug_productId?: CartUserIdStoreSlugProductIdCompoundUniqueInput
    AND?: CartWhereInput | CartWhereInput[]
    OR?: CartWhereInput[]
    NOT?: CartWhereInput | CartWhereInput[]
    userId?: StringFilter<"Cart"> | string
    storeSlug?: StringFilter<"Cart"> | string
    productId?: IntFilter<"Cart"> | number
    title?: StringFilter<"Cart"> | string
    price?: FloatFilter<"Cart"> | number
    quantity?: IntFilter<"Cart"> | number
    updatedAt?: DateTimeFilter<"Cart"> | Date | string
  }, "id" | "userId_storeSlug_productId">

  export type CartOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    storeSlug?: SortOrder
    productId?: SortOrder
    title?: SortOrder
    price?: SortOrder
    quantity?: SortOrder
    updatedAt?: SortOrder
    _count?: CartCountOrderByAggregateInput
    _avg?: CartAvgOrderByAggregateInput
    _max?: CartMaxOrderByAggregateInput
    _min?: CartMinOrderByAggregateInput
    _sum?: CartSumOrderByAggregateInput
  }

  export type CartScalarWhereWithAggregatesInput = {
    AND?: CartScalarWhereWithAggregatesInput | CartScalarWhereWithAggregatesInput[]
    OR?: CartScalarWhereWithAggregatesInput[]
    NOT?: CartScalarWhereWithAggregatesInput | CartScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Cart"> | number
    userId?: StringWithAggregatesFilter<"Cart"> | string
    storeSlug?: StringWithAggregatesFilter<"Cart"> | string
    productId?: IntWithAggregatesFilter<"Cart"> | number
    title?: StringWithAggregatesFilter<"Cart"> | string
    price?: FloatWithAggregatesFilter<"Cart"> | number
    quantity?: IntWithAggregatesFilter<"Cart"> | number
    updatedAt?: DateTimeWithAggregatesFilter<"Cart"> | Date | string
  }

  export type CachedCategoryWhereInput = {
    AND?: CachedCategoryWhereInput | CachedCategoryWhereInput[]
    OR?: CachedCategoryWhereInput[]
    NOT?: CachedCategoryWhereInput | CachedCategoryWhereInput[]
    id?: IntFilter<"CachedCategory"> | number
    storeSlug?: StringFilter<"CachedCategory"> | string
    sellerId?: IntFilter<"CachedCategory"> | number
    name?: StringFilter<"CachedCategory"> | string
    parentId?: IntNullableFilter<"CachedCategory"> | number | null
    syncedAt?: DateTimeFilter<"CachedCategory"> | Date | string
  }

  export type CachedCategoryOrderByWithRelationInput = {
    id?: SortOrder
    storeSlug?: SortOrder
    sellerId?: SortOrder
    name?: SortOrder
    parentId?: SortOrderInput | SortOrder
    syncedAt?: SortOrder
  }

  export type CachedCategoryWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    storeSlug_sellerId?: CachedCategoryStoreSlugSellerIdCompoundUniqueInput
    AND?: CachedCategoryWhereInput | CachedCategoryWhereInput[]
    OR?: CachedCategoryWhereInput[]
    NOT?: CachedCategoryWhereInput | CachedCategoryWhereInput[]
    storeSlug?: StringFilter<"CachedCategory"> | string
    sellerId?: IntFilter<"CachedCategory"> | number
    name?: StringFilter<"CachedCategory"> | string
    parentId?: IntNullableFilter<"CachedCategory"> | number | null
    syncedAt?: DateTimeFilter<"CachedCategory"> | Date | string
  }, "id" | "storeSlug_sellerId">

  export type CachedCategoryOrderByWithAggregationInput = {
    id?: SortOrder
    storeSlug?: SortOrder
    sellerId?: SortOrder
    name?: SortOrder
    parentId?: SortOrderInput | SortOrder
    syncedAt?: SortOrder
    _count?: CachedCategoryCountOrderByAggregateInput
    _avg?: CachedCategoryAvgOrderByAggregateInput
    _max?: CachedCategoryMaxOrderByAggregateInput
    _min?: CachedCategoryMinOrderByAggregateInput
    _sum?: CachedCategorySumOrderByAggregateInput
  }

  export type CachedCategoryScalarWhereWithAggregatesInput = {
    AND?: CachedCategoryScalarWhereWithAggregatesInput | CachedCategoryScalarWhereWithAggregatesInput[]
    OR?: CachedCategoryScalarWhereWithAggregatesInput[]
    NOT?: CachedCategoryScalarWhereWithAggregatesInput | CachedCategoryScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"CachedCategory"> | number
    storeSlug?: StringWithAggregatesFilter<"CachedCategory"> | string
    sellerId?: IntWithAggregatesFilter<"CachedCategory"> | number
    name?: StringWithAggregatesFilter<"CachedCategory"> | string
    parentId?: IntNullableWithAggregatesFilter<"CachedCategory"> | number | null
    syncedAt?: DateTimeWithAggregatesFilter<"CachedCategory"> | Date | string
  }

  export type CachedProductWhereInput = {
    AND?: CachedProductWhereInput | CachedProductWhereInput[]
    OR?: CachedProductWhereInput[]
    NOT?: CachedProductWhereInput | CachedProductWhereInput[]
    id?: IntFilter<"CachedProduct"> | number
    storeSlug?: StringFilter<"CachedProduct"> | string
    sellerId?: IntFilter<"CachedProduct"> | number
    title?: StringFilter<"CachedProduct"> | string
    description?: StringNullableFilter<"CachedProduct"> | string | null
    sku?: StringNullableFilter<"CachedProduct"> | string | null
    price?: FloatNullableFilter<"CachedProduct"> | number | null
    stockQuantity?: IntFilter<"CachedProduct"> | number
    categoryId?: IntNullableFilter<"CachedProduct"> | number | null
    tags?: StringNullableListFilter<"CachedProduct">
    images?: StringNullableListFilter<"CachedProduct">
    active?: BoolFilter<"CachedProduct"> | boolean
    syncedAt?: DateTimeFilter<"CachedProduct"> | Date | string
  }

  export type CachedProductOrderByWithRelationInput = {
    id?: SortOrder
    storeSlug?: SortOrder
    sellerId?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    sku?: SortOrderInput | SortOrder
    price?: SortOrderInput | SortOrder
    stockQuantity?: SortOrder
    categoryId?: SortOrderInput | SortOrder
    tags?: SortOrder
    images?: SortOrder
    active?: SortOrder
    syncedAt?: SortOrder
  }

  export type CachedProductWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    storeSlug_sellerId?: CachedProductStoreSlugSellerIdCompoundUniqueInput
    AND?: CachedProductWhereInput | CachedProductWhereInput[]
    OR?: CachedProductWhereInput[]
    NOT?: CachedProductWhereInput | CachedProductWhereInput[]
    storeSlug?: StringFilter<"CachedProduct"> | string
    sellerId?: IntFilter<"CachedProduct"> | number
    title?: StringFilter<"CachedProduct"> | string
    description?: StringNullableFilter<"CachedProduct"> | string | null
    sku?: StringNullableFilter<"CachedProduct"> | string | null
    price?: FloatNullableFilter<"CachedProduct"> | number | null
    stockQuantity?: IntFilter<"CachedProduct"> | number
    categoryId?: IntNullableFilter<"CachedProduct"> | number | null
    tags?: StringNullableListFilter<"CachedProduct">
    images?: StringNullableListFilter<"CachedProduct">
    active?: BoolFilter<"CachedProduct"> | boolean
    syncedAt?: DateTimeFilter<"CachedProduct"> | Date | string
  }, "id" | "storeSlug_sellerId">

  export type CachedProductOrderByWithAggregationInput = {
    id?: SortOrder
    storeSlug?: SortOrder
    sellerId?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    sku?: SortOrderInput | SortOrder
    price?: SortOrderInput | SortOrder
    stockQuantity?: SortOrder
    categoryId?: SortOrderInput | SortOrder
    tags?: SortOrder
    images?: SortOrder
    active?: SortOrder
    syncedAt?: SortOrder
    _count?: CachedProductCountOrderByAggregateInput
    _avg?: CachedProductAvgOrderByAggregateInput
    _max?: CachedProductMaxOrderByAggregateInput
    _min?: CachedProductMinOrderByAggregateInput
    _sum?: CachedProductSumOrderByAggregateInput
  }

  export type CachedProductScalarWhereWithAggregatesInput = {
    AND?: CachedProductScalarWhereWithAggregatesInput | CachedProductScalarWhereWithAggregatesInput[]
    OR?: CachedProductScalarWhereWithAggregatesInput[]
    NOT?: CachedProductScalarWhereWithAggregatesInput | CachedProductScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"CachedProduct"> | number
    storeSlug?: StringWithAggregatesFilter<"CachedProduct"> | string
    sellerId?: IntWithAggregatesFilter<"CachedProduct"> | number
    title?: StringWithAggregatesFilter<"CachedProduct"> | string
    description?: StringNullableWithAggregatesFilter<"CachedProduct"> | string | null
    sku?: StringNullableWithAggregatesFilter<"CachedProduct"> | string | null
    price?: FloatNullableWithAggregatesFilter<"CachedProduct"> | number | null
    stockQuantity?: IntWithAggregatesFilter<"CachedProduct"> | number
    categoryId?: IntNullableWithAggregatesFilter<"CachedProduct"> | number | null
    tags?: StringNullableListFilter<"CachedProduct">
    images?: StringNullableListFilter<"CachedProduct">
    active?: BoolWithAggregatesFilter<"CachedProduct"> | boolean
    syncedAt?: DateTimeWithAggregatesFilter<"CachedProduct"> | Date | string
  }

  export type PaymentWhereInput = {
    AND?: PaymentWhereInput | PaymentWhereInput[]
    OR?: PaymentWhereInput[]
    NOT?: PaymentWhereInput | PaymentWhereInput[]
    id?: IntFilter<"Payment"> | number
    referenceId?: StringFilter<"Payment"> | string
    storeSlug?: StringFilter<"Payment"> | string
    orderId?: IntFilter<"Payment"> | number
    buyerRef?: StringFilter<"Payment"> | string
    amount?: FloatFilter<"Payment"> | number
    currency?: StringFilter<"Payment"> | string
    provider?: StringFilter<"Payment"> | string
    status?: StringFilter<"Payment"> | string
    paymentUrl?: StringNullableFilter<"Payment"> | string | null
    createdAt?: DateTimeFilter<"Payment"> | Date | string
    updatedAt?: DateTimeFilter<"Payment"> | Date | string
  }

  export type PaymentOrderByWithRelationInput = {
    id?: SortOrder
    referenceId?: SortOrder
    storeSlug?: SortOrder
    orderId?: SortOrder
    buyerRef?: SortOrder
    amount?: SortOrder
    currency?: SortOrder
    provider?: SortOrder
    status?: SortOrder
    paymentUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PaymentWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    referenceId?: string
    AND?: PaymentWhereInput | PaymentWhereInput[]
    OR?: PaymentWhereInput[]
    NOT?: PaymentWhereInput | PaymentWhereInput[]
    storeSlug?: StringFilter<"Payment"> | string
    orderId?: IntFilter<"Payment"> | number
    buyerRef?: StringFilter<"Payment"> | string
    amount?: FloatFilter<"Payment"> | number
    currency?: StringFilter<"Payment"> | string
    provider?: StringFilter<"Payment"> | string
    status?: StringFilter<"Payment"> | string
    paymentUrl?: StringNullableFilter<"Payment"> | string | null
    createdAt?: DateTimeFilter<"Payment"> | Date | string
    updatedAt?: DateTimeFilter<"Payment"> | Date | string
  }, "id" | "referenceId">

  export type PaymentOrderByWithAggregationInput = {
    id?: SortOrder
    referenceId?: SortOrder
    storeSlug?: SortOrder
    orderId?: SortOrder
    buyerRef?: SortOrder
    amount?: SortOrder
    currency?: SortOrder
    provider?: SortOrder
    status?: SortOrder
    paymentUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PaymentCountOrderByAggregateInput
    _avg?: PaymentAvgOrderByAggregateInput
    _max?: PaymentMaxOrderByAggregateInput
    _min?: PaymentMinOrderByAggregateInput
    _sum?: PaymentSumOrderByAggregateInput
  }

  export type PaymentScalarWhereWithAggregatesInput = {
    AND?: PaymentScalarWhereWithAggregatesInput | PaymentScalarWhereWithAggregatesInput[]
    OR?: PaymentScalarWhereWithAggregatesInput[]
    NOT?: PaymentScalarWhereWithAggregatesInput | PaymentScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Payment"> | number
    referenceId?: StringWithAggregatesFilter<"Payment"> | string
    storeSlug?: StringWithAggregatesFilter<"Payment"> | string
    orderId?: IntWithAggregatesFilter<"Payment"> | number
    buyerRef?: StringWithAggregatesFilter<"Payment"> | string
    amount?: FloatWithAggregatesFilter<"Payment"> | number
    currency?: StringWithAggregatesFilter<"Payment"> | string
    provider?: StringWithAggregatesFilter<"Payment"> | string
    status?: StringWithAggregatesFilter<"Payment"> | string
    paymentUrl?: StringNullableWithAggregatesFilter<"Payment"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Payment"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Payment"> | Date | string
  }

  export type RetailerWhereInput = {
    AND?: RetailerWhereInput | RetailerWhereInput[]
    OR?: RetailerWhereInput[]
    NOT?: RetailerWhereInput | RetailerWhereInput[]
    id?: IntFilter<"Retailer"> | number
    slug?: StringFilter<"Retailer"> | string
    name?: StringFilter<"Retailer"> | string
    contactEmail?: StringFilter<"Retailer"> | string
    mcpServerUrl?: StringFilter<"Retailer"> | string
    businessPermitUrl?: StringNullableFilter<"Retailer"> | string | null
    verified?: BoolFilter<"Retailer"> | boolean
    active?: BoolFilter<"Retailer"> | boolean
    createdAt?: DateTimeFilter<"Retailer"> | Date | string
    updatedAt?: DateTimeFilter<"Retailer"> | Date | string
    aiProvider?: StringNullableFilter<"Retailer"> | string | null
    aiApiKey?: StringNullableFilter<"Retailer"> | string | null
    aiModel?: StringNullableFilter<"Retailer"> | string | null
    aiSystemPrompt?: StringNullableFilter<"Retailer"> | string | null
    serperApiKey?: StringNullableFilter<"Retailer"> | string | null
    telegramNotifyChatId?: StringNullableFilter<"Retailer"> | string | null
    paymentProvider?: StringNullableFilter<"Retailer"> | string | null
    paymentApiKey?: StringNullableFilter<"Retailer"> | string | null
    paymentPublicKey?: StringNullableFilter<"Retailer"> | string | null
    paymentWebhookSecret?: StringNullableFilter<"Retailer"> | string | null
    platformKey?: XOR<PlatformKeyNullableScalarRelationFilter, PlatformKeyWhereInput> | null
    auditLogs?: AuditLogListRelationFilter
  }

  export type RetailerOrderByWithRelationInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    contactEmail?: SortOrder
    mcpServerUrl?: SortOrder
    businessPermitUrl?: SortOrderInput | SortOrder
    verified?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    aiProvider?: SortOrderInput | SortOrder
    aiApiKey?: SortOrderInput | SortOrder
    aiModel?: SortOrderInput | SortOrder
    aiSystemPrompt?: SortOrderInput | SortOrder
    serperApiKey?: SortOrderInput | SortOrder
    telegramNotifyChatId?: SortOrderInput | SortOrder
    paymentProvider?: SortOrderInput | SortOrder
    paymentApiKey?: SortOrderInput | SortOrder
    paymentPublicKey?: SortOrderInput | SortOrder
    paymentWebhookSecret?: SortOrderInput | SortOrder
    platformKey?: PlatformKeyOrderByWithRelationInput
    auditLogs?: AuditLogOrderByRelationAggregateInput
  }

  export type RetailerWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    slug?: string
    name?: string
    AND?: RetailerWhereInput | RetailerWhereInput[]
    OR?: RetailerWhereInput[]
    NOT?: RetailerWhereInput | RetailerWhereInput[]
    contactEmail?: StringFilter<"Retailer"> | string
    mcpServerUrl?: StringFilter<"Retailer"> | string
    businessPermitUrl?: StringNullableFilter<"Retailer"> | string | null
    verified?: BoolFilter<"Retailer"> | boolean
    active?: BoolFilter<"Retailer"> | boolean
    createdAt?: DateTimeFilter<"Retailer"> | Date | string
    updatedAt?: DateTimeFilter<"Retailer"> | Date | string
    aiProvider?: StringNullableFilter<"Retailer"> | string | null
    aiApiKey?: StringNullableFilter<"Retailer"> | string | null
    aiModel?: StringNullableFilter<"Retailer"> | string | null
    aiSystemPrompt?: StringNullableFilter<"Retailer"> | string | null
    serperApiKey?: StringNullableFilter<"Retailer"> | string | null
    telegramNotifyChatId?: StringNullableFilter<"Retailer"> | string | null
    paymentProvider?: StringNullableFilter<"Retailer"> | string | null
    paymentApiKey?: StringNullableFilter<"Retailer"> | string | null
    paymentPublicKey?: StringNullableFilter<"Retailer"> | string | null
    paymentWebhookSecret?: StringNullableFilter<"Retailer"> | string | null
    platformKey?: XOR<PlatformKeyNullableScalarRelationFilter, PlatformKeyWhereInput> | null
    auditLogs?: AuditLogListRelationFilter
  }, "id" | "slug" | "name">

  export type RetailerOrderByWithAggregationInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    contactEmail?: SortOrder
    mcpServerUrl?: SortOrder
    businessPermitUrl?: SortOrderInput | SortOrder
    verified?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    aiProvider?: SortOrderInput | SortOrder
    aiApiKey?: SortOrderInput | SortOrder
    aiModel?: SortOrderInput | SortOrder
    aiSystemPrompt?: SortOrderInput | SortOrder
    serperApiKey?: SortOrderInput | SortOrder
    telegramNotifyChatId?: SortOrderInput | SortOrder
    paymentProvider?: SortOrderInput | SortOrder
    paymentApiKey?: SortOrderInput | SortOrder
    paymentPublicKey?: SortOrderInput | SortOrder
    paymentWebhookSecret?: SortOrderInput | SortOrder
    _count?: RetailerCountOrderByAggregateInput
    _avg?: RetailerAvgOrderByAggregateInput
    _max?: RetailerMaxOrderByAggregateInput
    _min?: RetailerMinOrderByAggregateInput
    _sum?: RetailerSumOrderByAggregateInput
  }

  export type RetailerScalarWhereWithAggregatesInput = {
    AND?: RetailerScalarWhereWithAggregatesInput | RetailerScalarWhereWithAggregatesInput[]
    OR?: RetailerScalarWhereWithAggregatesInput[]
    NOT?: RetailerScalarWhereWithAggregatesInput | RetailerScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Retailer"> | number
    slug?: StringWithAggregatesFilter<"Retailer"> | string
    name?: StringWithAggregatesFilter<"Retailer"> | string
    contactEmail?: StringWithAggregatesFilter<"Retailer"> | string
    mcpServerUrl?: StringWithAggregatesFilter<"Retailer"> | string
    businessPermitUrl?: StringNullableWithAggregatesFilter<"Retailer"> | string | null
    verified?: BoolWithAggregatesFilter<"Retailer"> | boolean
    active?: BoolWithAggregatesFilter<"Retailer"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Retailer"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Retailer"> | Date | string
    aiProvider?: StringNullableWithAggregatesFilter<"Retailer"> | string | null
    aiApiKey?: StringNullableWithAggregatesFilter<"Retailer"> | string | null
    aiModel?: StringNullableWithAggregatesFilter<"Retailer"> | string | null
    aiSystemPrompt?: StringNullableWithAggregatesFilter<"Retailer"> | string | null
    serperApiKey?: StringNullableWithAggregatesFilter<"Retailer"> | string | null
    telegramNotifyChatId?: StringNullableWithAggregatesFilter<"Retailer"> | string | null
    paymentProvider?: StringNullableWithAggregatesFilter<"Retailer"> | string | null
    paymentApiKey?: StringNullableWithAggregatesFilter<"Retailer"> | string | null
    paymentPublicKey?: StringNullableWithAggregatesFilter<"Retailer"> | string | null
    paymentWebhookSecret?: StringNullableWithAggregatesFilter<"Retailer"> | string | null
  }

  export type PlatformKeyWhereInput = {
    AND?: PlatformKeyWhereInput | PlatformKeyWhereInput[]
    OR?: PlatformKeyWhereInput[]
    NOT?: PlatformKeyWhereInput | PlatformKeyWhereInput[]
    id?: IntFilter<"PlatformKey"> | number
    retailerId?: IntFilter<"PlatformKey"> | number
    key?: StringFilter<"PlatformKey"> | string
    issuedAt?: DateTimeFilter<"PlatformKey"> | Date | string
    revokedAt?: DateTimeNullableFilter<"PlatformKey"> | Date | string | null
    retailer?: XOR<RetailerScalarRelationFilter, RetailerWhereInput>
  }

  export type PlatformKeyOrderByWithRelationInput = {
    id?: SortOrder
    retailerId?: SortOrder
    key?: SortOrder
    issuedAt?: SortOrder
    revokedAt?: SortOrderInput | SortOrder
    retailer?: RetailerOrderByWithRelationInput
  }

  export type PlatformKeyWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    retailerId?: number
    key?: string
    AND?: PlatformKeyWhereInput | PlatformKeyWhereInput[]
    OR?: PlatformKeyWhereInput[]
    NOT?: PlatformKeyWhereInput | PlatformKeyWhereInput[]
    issuedAt?: DateTimeFilter<"PlatformKey"> | Date | string
    revokedAt?: DateTimeNullableFilter<"PlatformKey"> | Date | string | null
    retailer?: XOR<RetailerScalarRelationFilter, RetailerWhereInput>
  }, "id" | "retailerId" | "key">

  export type PlatformKeyOrderByWithAggregationInput = {
    id?: SortOrder
    retailerId?: SortOrder
    key?: SortOrder
    issuedAt?: SortOrder
    revokedAt?: SortOrderInput | SortOrder
    _count?: PlatformKeyCountOrderByAggregateInput
    _avg?: PlatformKeyAvgOrderByAggregateInput
    _max?: PlatformKeyMaxOrderByAggregateInput
    _min?: PlatformKeyMinOrderByAggregateInput
    _sum?: PlatformKeySumOrderByAggregateInput
  }

  export type PlatformKeyScalarWhereWithAggregatesInput = {
    AND?: PlatformKeyScalarWhereWithAggregatesInput | PlatformKeyScalarWhereWithAggregatesInput[]
    OR?: PlatformKeyScalarWhereWithAggregatesInput[]
    NOT?: PlatformKeyScalarWhereWithAggregatesInput | PlatformKeyScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"PlatformKey"> | number
    retailerId?: IntWithAggregatesFilter<"PlatformKey"> | number
    key?: StringWithAggregatesFilter<"PlatformKey"> | string
    issuedAt?: DateTimeWithAggregatesFilter<"PlatformKey"> | Date | string
    revokedAt?: DateTimeNullableWithAggregatesFilter<"PlatformKey"> | Date | string | null
  }

  export type AuditLogWhereInput = {
    AND?: AuditLogWhereInput | AuditLogWhereInput[]
    OR?: AuditLogWhereInput[]
    NOT?: AuditLogWhereInput | AuditLogWhereInput[]
    id?: IntFilter<"AuditLog"> | number
    retailerId?: IntFilter<"AuditLog"> | number
    event?: StringFilter<"AuditLog"> | string
    meta?: JsonNullableFilter<"AuditLog">
    createdAt?: DateTimeFilter<"AuditLog"> | Date | string
    retailer?: XOR<RetailerScalarRelationFilter, RetailerWhereInput>
  }

  export type AuditLogOrderByWithRelationInput = {
    id?: SortOrder
    retailerId?: SortOrder
    event?: SortOrder
    meta?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    retailer?: RetailerOrderByWithRelationInput
  }

  export type AuditLogWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: AuditLogWhereInput | AuditLogWhereInput[]
    OR?: AuditLogWhereInput[]
    NOT?: AuditLogWhereInput | AuditLogWhereInput[]
    retailerId?: IntFilter<"AuditLog"> | number
    event?: StringFilter<"AuditLog"> | string
    meta?: JsonNullableFilter<"AuditLog">
    createdAt?: DateTimeFilter<"AuditLog"> | Date | string
    retailer?: XOR<RetailerScalarRelationFilter, RetailerWhereInput>
  }, "id">

  export type AuditLogOrderByWithAggregationInput = {
    id?: SortOrder
    retailerId?: SortOrder
    event?: SortOrder
    meta?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: AuditLogCountOrderByAggregateInput
    _avg?: AuditLogAvgOrderByAggregateInput
    _max?: AuditLogMaxOrderByAggregateInput
    _min?: AuditLogMinOrderByAggregateInput
    _sum?: AuditLogSumOrderByAggregateInput
  }

  export type AuditLogScalarWhereWithAggregatesInput = {
    AND?: AuditLogScalarWhereWithAggregatesInput | AuditLogScalarWhereWithAggregatesInput[]
    OR?: AuditLogScalarWhereWithAggregatesInput[]
    NOT?: AuditLogScalarWhereWithAggregatesInput | AuditLogScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"AuditLog"> | number
    retailerId?: IntWithAggregatesFilter<"AuditLog"> | number
    event?: StringWithAggregatesFilter<"AuditLog"> | string
    meta?: JsonNullableWithAggregatesFilter<"AuditLog">
    createdAt?: DateTimeWithAggregatesFilter<"AuditLog"> | Date | string
  }

  export type SettingWhereInput = {
    AND?: SettingWhereInput | SettingWhereInput[]
    OR?: SettingWhereInput[]
    NOT?: SettingWhereInput | SettingWhereInput[]
    key?: StringFilter<"Setting"> | string
    value?: StringFilter<"Setting"> | string
    updatedAt?: DateTimeFilter<"Setting"> | Date | string
  }

  export type SettingOrderByWithRelationInput = {
    key?: SortOrder
    value?: SortOrder
    updatedAt?: SortOrder
  }

  export type SettingWhereUniqueInput = Prisma.AtLeast<{
    key?: string
    AND?: SettingWhereInput | SettingWhereInput[]
    OR?: SettingWhereInput[]
    NOT?: SettingWhereInput | SettingWhereInput[]
    value?: StringFilter<"Setting"> | string
    updatedAt?: DateTimeFilter<"Setting"> | Date | string
  }, "key">

  export type SettingOrderByWithAggregationInput = {
    key?: SortOrder
    value?: SortOrder
    updatedAt?: SortOrder
    _count?: SettingCountOrderByAggregateInput
    _max?: SettingMaxOrderByAggregateInput
    _min?: SettingMinOrderByAggregateInput
  }

  export type SettingScalarWhereWithAggregatesInput = {
    AND?: SettingScalarWhereWithAggregatesInput | SettingScalarWhereWithAggregatesInput[]
    OR?: SettingScalarWhereWithAggregatesInput[]
    NOT?: SettingScalarWhereWithAggregatesInput | SettingScalarWhereWithAggregatesInput[]
    key?: StringWithAggregatesFilter<"Setting"> | string
    value?: StringWithAggregatesFilter<"Setting"> | string
    updatedAt?: DateTimeWithAggregatesFilter<"Setting"> | Date | string
  }

  export type AdminUserCreateInput = {
    username: string
    passwordHash: string
    createdAt?: Date | string
  }

  export type AdminUserUncheckedCreateInput = {
    id?: number
    username: string
    passwordHash: string
    createdAt?: Date | string
  }

  export type AdminUserUpdateInput = {
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdminUserUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdminUserCreateManyInput = {
    id?: number
    username: string
    passwordHash: string
    createdAt?: Date | string
  }

  export type AdminUserUpdateManyMutationInput = {
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdminUserUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CartCreateInput = {
    userId: string
    storeSlug: string
    productId: number
    title: string
    price: number
    quantity?: number
    updatedAt?: Date | string
  }

  export type CartUncheckedCreateInput = {
    id?: number
    userId: string
    storeSlug: string
    productId: number
    title: string
    price: number
    quantity?: number
    updatedAt?: Date | string
  }

  export type CartUpdateInput = {
    userId?: StringFieldUpdateOperationsInput | string
    storeSlug?: StringFieldUpdateOperationsInput | string
    productId?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CartUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: StringFieldUpdateOperationsInput | string
    storeSlug?: StringFieldUpdateOperationsInput | string
    productId?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CartCreateManyInput = {
    id?: number
    userId: string
    storeSlug: string
    productId: number
    title: string
    price: number
    quantity?: number
    updatedAt?: Date | string
  }

  export type CartUpdateManyMutationInput = {
    userId?: StringFieldUpdateOperationsInput | string
    storeSlug?: StringFieldUpdateOperationsInput | string
    productId?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CartUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: StringFieldUpdateOperationsInput | string
    storeSlug?: StringFieldUpdateOperationsInput | string
    productId?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedCategoryCreateInput = {
    storeSlug: string
    sellerId: number
    name: string
    parentId?: number | null
    syncedAt?: Date | string
  }

  export type CachedCategoryUncheckedCreateInput = {
    id?: number
    storeSlug: string
    sellerId: number
    name: string
    parentId?: number | null
    syncedAt?: Date | string
  }

  export type CachedCategoryUpdateInput = {
    storeSlug?: StringFieldUpdateOperationsInput | string
    sellerId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    parentId?: NullableIntFieldUpdateOperationsInput | number | null
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedCategoryUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    storeSlug?: StringFieldUpdateOperationsInput | string
    sellerId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    parentId?: NullableIntFieldUpdateOperationsInput | number | null
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedCategoryCreateManyInput = {
    id?: number
    storeSlug: string
    sellerId: number
    name: string
    parentId?: number | null
    syncedAt?: Date | string
  }

  export type CachedCategoryUpdateManyMutationInput = {
    storeSlug?: StringFieldUpdateOperationsInput | string
    sellerId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    parentId?: NullableIntFieldUpdateOperationsInput | number | null
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedCategoryUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    storeSlug?: StringFieldUpdateOperationsInput | string
    sellerId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    parentId?: NullableIntFieldUpdateOperationsInput | number | null
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedProductCreateInput = {
    storeSlug: string
    sellerId: number
    title: string
    description?: string | null
    sku?: string | null
    price?: number | null
    stockQuantity?: number
    categoryId?: number | null
    tags?: CachedProductCreatetagsInput | string[]
    images?: CachedProductCreateimagesInput | string[]
    active?: boolean
    syncedAt?: Date | string
  }

  export type CachedProductUncheckedCreateInput = {
    id?: number
    storeSlug: string
    sellerId: number
    title: string
    description?: string | null
    sku?: string | null
    price?: number | null
    stockQuantity?: number
    categoryId?: number | null
    tags?: CachedProductCreatetagsInput | string[]
    images?: CachedProductCreateimagesInput | string[]
    active?: boolean
    syncedAt?: Date | string
  }

  export type CachedProductUpdateInput = {
    storeSlug?: StringFieldUpdateOperationsInput | string
    sellerId?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    sku?: NullableStringFieldUpdateOperationsInput | string | null
    price?: NullableFloatFieldUpdateOperationsInput | number | null
    stockQuantity?: IntFieldUpdateOperationsInput | number
    categoryId?: NullableIntFieldUpdateOperationsInput | number | null
    tags?: CachedProductUpdatetagsInput | string[]
    images?: CachedProductUpdateimagesInput | string[]
    active?: BoolFieldUpdateOperationsInput | boolean
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedProductUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    storeSlug?: StringFieldUpdateOperationsInput | string
    sellerId?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    sku?: NullableStringFieldUpdateOperationsInput | string | null
    price?: NullableFloatFieldUpdateOperationsInput | number | null
    stockQuantity?: IntFieldUpdateOperationsInput | number
    categoryId?: NullableIntFieldUpdateOperationsInput | number | null
    tags?: CachedProductUpdatetagsInput | string[]
    images?: CachedProductUpdateimagesInput | string[]
    active?: BoolFieldUpdateOperationsInput | boolean
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedProductCreateManyInput = {
    id?: number
    storeSlug: string
    sellerId: number
    title: string
    description?: string | null
    sku?: string | null
    price?: number | null
    stockQuantity?: number
    categoryId?: number | null
    tags?: CachedProductCreatetagsInput | string[]
    images?: CachedProductCreateimagesInput | string[]
    active?: boolean
    syncedAt?: Date | string
  }

  export type CachedProductUpdateManyMutationInput = {
    storeSlug?: StringFieldUpdateOperationsInput | string
    sellerId?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    sku?: NullableStringFieldUpdateOperationsInput | string | null
    price?: NullableFloatFieldUpdateOperationsInput | number | null
    stockQuantity?: IntFieldUpdateOperationsInput | number
    categoryId?: NullableIntFieldUpdateOperationsInput | number | null
    tags?: CachedProductUpdatetagsInput | string[]
    images?: CachedProductUpdateimagesInput | string[]
    active?: BoolFieldUpdateOperationsInput | boolean
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CachedProductUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    storeSlug?: StringFieldUpdateOperationsInput | string
    sellerId?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    sku?: NullableStringFieldUpdateOperationsInput | string | null
    price?: NullableFloatFieldUpdateOperationsInput | number | null
    stockQuantity?: IntFieldUpdateOperationsInput | number
    categoryId?: NullableIntFieldUpdateOperationsInput | number | null
    tags?: CachedProductUpdatetagsInput | string[]
    images?: CachedProductUpdateimagesInput | string[]
    active?: BoolFieldUpdateOperationsInput | boolean
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PaymentCreateInput = {
    referenceId: string
    storeSlug: string
    orderId: number
    buyerRef: string
    amount: number
    currency?: string
    provider: string
    status?: string
    paymentUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PaymentUncheckedCreateInput = {
    id?: number
    referenceId: string
    storeSlug: string
    orderId: number
    buyerRef: string
    amount: number
    currency?: string
    provider: string
    status?: string
    paymentUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PaymentUpdateInput = {
    referenceId?: StringFieldUpdateOperationsInput | string
    storeSlug?: StringFieldUpdateOperationsInput | string
    orderId?: IntFieldUpdateOperationsInput | number
    buyerRef?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    paymentUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PaymentUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    referenceId?: StringFieldUpdateOperationsInput | string
    storeSlug?: StringFieldUpdateOperationsInput | string
    orderId?: IntFieldUpdateOperationsInput | number
    buyerRef?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    paymentUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PaymentCreateManyInput = {
    id?: number
    referenceId: string
    storeSlug: string
    orderId: number
    buyerRef: string
    amount: number
    currency?: string
    provider: string
    status?: string
    paymentUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PaymentUpdateManyMutationInput = {
    referenceId?: StringFieldUpdateOperationsInput | string
    storeSlug?: StringFieldUpdateOperationsInput | string
    orderId?: IntFieldUpdateOperationsInput | number
    buyerRef?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    paymentUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PaymentUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    referenceId?: StringFieldUpdateOperationsInput | string
    storeSlug?: StringFieldUpdateOperationsInput | string
    orderId?: IntFieldUpdateOperationsInput | number
    buyerRef?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    paymentUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RetailerCreateInput = {
    slug: string
    name: string
    contactEmail: string
    mcpServerUrl: string
    businessPermitUrl?: string | null
    verified?: boolean
    active?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    aiProvider?: string | null
    aiApiKey?: string | null
    aiModel?: string | null
    aiSystemPrompt?: string | null
    serperApiKey?: string | null
    telegramNotifyChatId?: string | null
    paymentProvider?: string | null
    paymentApiKey?: string | null
    paymentPublicKey?: string | null
    paymentWebhookSecret?: string | null
    platformKey?: PlatformKeyCreateNestedOneWithoutRetailerInput
    auditLogs?: AuditLogCreateNestedManyWithoutRetailerInput
  }

  export type RetailerUncheckedCreateInput = {
    id?: number
    slug: string
    name: string
    contactEmail: string
    mcpServerUrl: string
    businessPermitUrl?: string | null
    verified?: boolean
    active?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    aiProvider?: string | null
    aiApiKey?: string | null
    aiModel?: string | null
    aiSystemPrompt?: string | null
    serperApiKey?: string | null
    telegramNotifyChatId?: string | null
    paymentProvider?: string | null
    paymentApiKey?: string | null
    paymentPublicKey?: string | null
    paymentWebhookSecret?: string | null
    platformKey?: PlatformKeyUncheckedCreateNestedOneWithoutRetailerInput
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutRetailerInput
  }

  export type RetailerUpdateInput = {
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    mcpServerUrl?: StringFieldUpdateOperationsInput | string
    businessPermitUrl?: NullableStringFieldUpdateOperationsInput | string | null
    verified?: BoolFieldUpdateOperationsInput | boolean
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    aiProvider?: NullableStringFieldUpdateOperationsInput | string | null
    aiApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    aiSystemPrompt?: NullableStringFieldUpdateOperationsInput | string | null
    serperApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    telegramNotifyChatId?: NullableStringFieldUpdateOperationsInput | string | null
    paymentProvider?: NullableStringFieldUpdateOperationsInput | string | null
    paymentApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    paymentPublicKey?: NullableStringFieldUpdateOperationsInput | string | null
    paymentWebhookSecret?: NullableStringFieldUpdateOperationsInput | string | null
    platformKey?: PlatformKeyUpdateOneWithoutRetailerNestedInput
    auditLogs?: AuditLogUpdateManyWithoutRetailerNestedInput
  }

  export type RetailerUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    mcpServerUrl?: StringFieldUpdateOperationsInput | string
    businessPermitUrl?: NullableStringFieldUpdateOperationsInput | string | null
    verified?: BoolFieldUpdateOperationsInput | boolean
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    aiProvider?: NullableStringFieldUpdateOperationsInput | string | null
    aiApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    aiSystemPrompt?: NullableStringFieldUpdateOperationsInput | string | null
    serperApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    telegramNotifyChatId?: NullableStringFieldUpdateOperationsInput | string | null
    paymentProvider?: NullableStringFieldUpdateOperationsInput | string | null
    paymentApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    paymentPublicKey?: NullableStringFieldUpdateOperationsInput | string | null
    paymentWebhookSecret?: NullableStringFieldUpdateOperationsInput | string | null
    platformKey?: PlatformKeyUncheckedUpdateOneWithoutRetailerNestedInput
    auditLogs?: AuditLogUncheckedUpdateManyWithoutRetailerNestedInput
  }

  export type RetailerCreateManyInput = {
    id?: number
    slug: string
    name: string
    contactEmail: string
    mcpServerUrl: string
    businessPermitUrl?: string | null
    verified?: boolean
    active?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    aiProvider?: string | null
    aiApiKey?: string | null
    aiModel?: string | null
    aiSystemPrompt?: string | null
    serperApiKey?: string | null
    telegramNotifyChatId?: string | null
    paymentProvider?: string | null
    paymentApiKey?: string | null
    paymentPublicKey?: string | null
    paymentWebhookSecret?: string | null
  }

  export type RetailerUpdateManyMutationInput = {
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    mcpServerUrl?: StringFieldUpdateOperationsInput | string
    businessPermitUrl?: NullableStringFieldUpdateOperationsInput | string | null
    verified?: BoolFieldUpdateOperationsInput | boolean
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    aiProvider?: NullableStringFieldUpdateOperationsInput | string | null
    aiApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    aiSystemPrompt?: NullableStringFieldUpdateOperationsInput | string | null
    serperApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    telegramNotifyChatId?: NullableStringFieldUpdateOperationsInput | string | null
    paymentProvider?: NullableStringFieldUpdateOperationsInput | string | null
    paymentApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    paymentPublicKey?: NullableStringFieldUpdateOperationsInput | string | null
    paymentWebhookSecret?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RetailerUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    mcpServerUrl?: StringFieldUpdateOperationsInput | string
    businessPermitUrl?: NullableStringFieldUpdateOperationsInput | string | null
    verified?: BoolFieldUpdateOperationsInput | boolean
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    aiProvider?: NullableStringFieldUpdateOperationsInput | string | null
    aiApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    aiSystemPrompt?: NullableStringFieldUpdateOperationsInput | string | null
    serperApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    telegramNotifyChatId?: NullableStringFieldUpdateOperationsInput | string | null
    paymentProvider?: NullableStringFieldUpdateOperationsInput | string | null
    paymentApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    paymentPublicKey?: NullableStringFieldUpdateOperationsInput | string | null
    paymentWebhookSecret?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PlatformKeyCreateInput = {
    key: string
    issuedAt?: Date | string
    revokedAt?: Date | string | null
    retailer: RetailerCreateNestedOneWithoutPlatformKeyInput
  }

  export type PlatformKeyUncheckedCreateInput = {
    id?: number
    retailerId: number
    key: string
    issuedAt?: Date | string
    revokedAt?: Date | string | null
  }

  export type PlatformKeyUpdateInput = {
    key?: StringFieldUpdateOperationsInput | string
    issuedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    retailer?: RetailerUpdateOneRequiredWithoutPlatformKeyNestedInput
  }

  export type PlatformKeyUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    retailerId?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    issuedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PlatformKeyCreateManyInput = {
    id?: number
    retailerId: number
    key: string
    issuedAt?: Date | string
    revokedAt?: Date | string | null
  }

  export type PlatformKeyUpdateManyMutationInput = {
    key?: StringFieldUpdateOperationsInput | string
    issuedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PlatformKeyUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    retailerId?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    issuedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type AuditLogCreateInput = {
    event: string
    meta?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    retailer: RetailerCreateNestedOneWithoutAuditLogsInput
  }

  export type AuditLogUncheckedCreateInput = {
    id?: number
    retailerId: number
    event: string
    meta?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type AuditLogUpdateInput = {
    event?: StringFieldUpdateOperationsInput | string
    meta?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    retailer?: RetailerUpdateOneRequiredWithoutAuditLogsNestedInput
  }

  export type AuditLogUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    retailerId?: IntFieldUpdateOperationsInput | number
    event?: StringFieldUpdateOperationsInput | string
    meta?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogCreateManyInput = {
    id?: number
    retailerId: number
    event: string
    meta?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type AuditLogUpdateManyMutationInput = {
    event?: StringFieldUpdateOperationsInput | string
    meta?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    retailerId?: IntFieldUpdateOperationsInput | number
    event?: StringFieldUpdateOperationsInput | string
    meta?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SettingCreateInput = {
    key: string
    value: string
    updatedAt?: Date | string
  }

  export type SettingUncheckedCreateInput = {
    key: string
    value: string
    updatedAt?: Date | string
  }

  export type SettingUpdateInput = {
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SettingUncheckedUpdateInput = {
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SettingCreateManyInput = {
    key: string
    value: string
    updatedAt?: Date | string
  }

  export type SettingUpdateManyMutationInput = {
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SettingUncheckedUpdateManyInput = {
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type AdminUserCountOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    passwordHash?: SortOrder
    createdAt?: SortOrder
  }

  export type AdminUserAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type AdminUserMaxOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    passwordHash?: SortOrder
    createdAt?: SortOrder
  }

  export type AdminUserMinOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    passwordHash?: SortOrder
    createdAt?: SortOrder
  }

  export type AdminUserSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type CartUserIdStoreSlugProductIdCompoundUniqueInput = {
    userId: string
    storeSlug: string
    productId: number
  }

  export type CartCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    storeSlug?: SortOrder
    productId?: SortOrder
    title?: SortOrder
    price?: SortOrder
    quantity?: SortOrder
    updatedAt?: SortOrder
  }

  export type CartAvgOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    price?: SortOrder
    quantity?: SortOrder
  }

  export type CartMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    storeSlug?: SortOrder
    productId?: SortOrder
    title?: SortOrder
    price?: SortOrder
    quantity?: SortOrder
    updatedAt?: SortOrder
  }

  export type CartMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    storeSlug?: SortOrder
    productId?: SortOrder
    title?: SortOrder
    price?: SortOrder
    quantity?: SortOrder
    updatedAt?: SortOrder
  }

  export type CartSumOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    price?: SortOrder
    quantity?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type CachedCategoryStoreSlugSellerIdCompoundUniqueInput = {
    storeSlug: string
    sellerId: number
  }

  export type CachedCategoryCountOrderByAggregateInput = {
    id?: SortOrder
    storeSlug?: SortOrder
    sellerId?: SortOrder
    name?: SortOrder
    parentId?: SortOrder
    syncedAt?: SortOrder
  }

  export type CachedCategoryAvgOrderByAggregateInput = {
    id?: SortOrder
    sellerId?: SortOrder
    parentId?: SortOrder
  }

  export type CachedCategoryMaxOrderByAggregateInput = {
    id?: SortOrder
    storeSlug?: SortOrder
    sellerId?: SortOrder
    name?: SortOrder
    parentId?: SortOrder
    syncedAt?: SortOrder
  }

  export type CachedCategoryMinOrderByAggregateInput = {
    id?: SortOrder
    storeSlug?: SortOrder
    sellerId?: SortOrder
    name?: SortOrder
    parentId?: SortOrder
    syncedAt?: SortOrder
  }

  export type CachedCategorySumOrderByAggregateInput = {
    id?: SortOrder
    sellerId?: SortOrder
    parentId?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type CachedProductStoreSlugSellerIdCompoundUniqueInput = {
    storeSlug: string
    sellerId: number
  }

  export type CachedProductCountOrderByAggregateInput = {
    id?: SortOrder
    storeSlug?: SortOrder
    sellerId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    sku?: SortOrder
    price?: SortOrder
    stockQuantity?: SortOrder
    categoryId?: SortOrder
    tags?: SortOrder
    images?: SortOrder
    active?: SortOrder
    syncedAt?: SortOrder
  }

  export type CachedProductAvgOrderByAggregateInput = {
    id?: SortOrder
    sellerId?: SortOrder
    price?: SortOrder
    stockQuantity?: SortOrder
    categoryId?: SortOrder
  }

  export type CachedProductMaxOrderByAggregateInput = {
    id?: SortOrder
    storeSlug?: SortOrder
    sellerId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    sku?: SortOrder
    price?: SortOrder
    stockQuantity?: SortOrder
    categoryId?: SortOrder
    active?: SortOrder
    syncedAt?: SortOrder
  }

  export type CachedProductMinOrderByAggregateInput = {
    id?: SortOrder
    storeSlug?: SortOrder
    sellerId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    sku?: SortOrder
    price?: SortOrder
    stockQuantity?: SortOrder
    categoryId?: SortOrder
    active?: SortOrder
    syncedAt?: SortOrder
  }

  export type CachedProductSumOrderByAggregateInput = {
    id?: SortOrder
    sellerId?: SortOrder
    price?: SortOrder
    stockQuantity?: SortOrder
    categoryId?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type PaymentCountOrderByAggregateInput = {
    id?: SortOrder
    referenceId?: SortOrder
    storeSlug?: SortOrder
    orderId?: SortOrder
    buyerRef?: SortOrder
    amount?: SortOrder
    currency?: SortOrder
    provider?: SortOrder
    status?: SortOrder
    paymentUrl?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PaymentAvgOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    amount?: SortOrder
  }

  export type PaymentMaxOrderByAggregateInput = {
    id?: SortOrder
    referenceId?: SortOrder
    storeSlug?: SortOrder
    orderId?: SortOrder
    buyerRef?: SortOrder
    amount?: SortOrder
    currency?: SortOrder
    provider?: SortOrder
    status?: SortOrder
    paymentUrl?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PaymentMinOrderByAggregateInput = {
    id?: SortOrder
    referenceId?: SortOrder
    storeSlug?: SortOrder
    orderId?: SortOrder
    buyerRef?: SortOrder
    amount?: SortOrder
    currency?: SortOrder
    provider?: SortOrder
    status?: SortOrder
    paymentUrl?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PaymentSumOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    amount?: SortOrder
  }

  export type PlatformKeyNullableScalarRelationFilter = {
    is?: PlatformKeyWhereInput | null
    isNot?: PlatformKeyWhereInput | null
  }

  export type AuditLogListRelationFilter = {
    every?: AuditLogWhereInput
    some?: AuditLogWhereInput
    none?: AuditLogWhereInput
  }

  export type AuditLogOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RetailerCountOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    contactEmail?: SortOrder
    mcpServerUrl?: SortOrder
    businessPermitUrl?: SortOrder
    verified?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    aiProvider?: SortOrder
    aiApiKey?: SortOrder
    aiModel?: SortOrder
    aiSystemPrompt?: SortOrder
    serperApiKey?: SortOrder
    telegramNotifyChatId?: SortOrder
    paymentProvider?: SortOrder
    paymentApiKey?: SortOrder
    paymentPublicKey?: SortOrder
    paymentWebhookSecret?: SortOrder
  }

  export type RetailerAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type RetailerMaxOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    contactEmail?: SortOrder
    mcpServerUrl?: SortOrder
    businessPermitUrl?: SortOrder
    verified?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    aiProvider?: SortOrder
    aiApiKey?: SortOrder
    aiModel?: SortOrder
    aiSystemPrompt?: SortOrder
    serperApiKey?: SortOrder
    telegramNotifyChatId?: SortOrder
    paymentProvider?: SortOrder
    paymentApiKey?: SortOrder
    paymentPublicKey?: SortOrder
    paymentWebhookSecret?: SortOrder
  }

  export type RetailerMinOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    contactEmail?: SortOrder
    mcpServerUrl?: SortOrder
    businessPermitUrl?: SortOrder
    verified?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    aiProvider?: SortOrder
    aiApiKey?: SortOrder
    aiModel?: SortOrder
    aiSystemPrompt?: SortOrder
    serperApiKey?: SortOrder
    telegramNotifyChatId?: SortOrder
    paymentProvider?: SortOrder
    paymentApiKey?: SortOrder
    paymentPublicKey?: SortOrder
    paymentWebhookSecret?: SortOrder
  }

  export type RetailerSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type RetailerScalarRelationFilter = {
    is?: RetailerWhereInput
    isNot?: RetailerWhereInput
  }

  export type PlatformKeyCountOrderByAggregateInput = {
    id?: SortOrder
    retailerId?: SortOrder
    key?: SortOrder
    issuedAt?: SortOrder
    revokedAt?: SortOrder
  }

  export type PlatformKeyAvgOrderByAggregateInput = {
    id?: SortOrder
    retailerId?: SortOrder
  }

  export type PlatformKeyMaxOrderByAggregateInput = {
    id?: SortOrder
    retailerId?: SortOrder
    key?: SortOrder
    issuedAt?: SortOrder
    revokedAt?: SortOrder
  }

  export type PlatformKeyMinOrderByAggregateInput = {
    id?: SortOrder
    retailerId?: SortOrder
    key?: SortOrder
    issuedAt?: SortOrder
    revokedAt?: SortOrder
  }

  export type PlatformKeySumOrderByAggregateInput = {
    id?: SortOrder
    retailerId?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type AuditLogCountOrderByAggregateInput = {
    id?: SortOrder
    retailerId?: SortOrder
    event?: SortOrder
    meta?: SortOrder
    createdAt?: SortOrder
  }

  export type AuditLogAvgOrderByAggregateInput = {
    id?: SortOrder
    retailerId?: SortOrder
  }

  export type AuditLogMaxOrderByAggregateInput = {
    id?: SortOrder
    retailerId?: SortOrder
    event?: SortOrder
    createdAt?: SortOrder
  }

  export type AuditLogMinOrderByAggregateInput = {
    id?: SortOrder
    retailerId?: SortOrder
    event?: SortOrder
    createdAt?: SortOrder
  }

  export type AuditLogSumOrderByAggregateInput = {
    id?: SortOrder
    retailerId?: SortOrder
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type SettingCountOrderByAggregateInput = {
    key?: SortOrder
    value?: SortOrder
    updatedAt?: SortOrder
  }

  export type SettingMaxOrderByAggregateInput = {
    key?: SortOrder
    value?: SortOrder
    updatedAt?: SortOrder
  }

  export type SettingMinOrderByAggregateInput = {
    key?: SortOrder
    value?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type CachedProductCreatetagsInput = {
    set: string[]
  }

  export type CachedProductCreateimagesInput = {
    set: string[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type CachedProductUpdatetagsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type CachedProductUpdateimagesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type PlatformKeyCreateNestedOneWithoutRetailerInput = {
    create?: XOR<PlatformKeyCreateWithoutRetailerInput, PlatformKeyUncheckedCreateWithoutRetailerInput>
    connectOrCreate?: PlatformKeyCreateOrConnectWithoutRetailerInput
    connect?: PlatformKeyWhereUniqueInput
  }

  export type AuditLogCreateNestedManyWithoutRetailerInput = {
    create?: XOR<AuditLogCreateWithoutRetailerInput, AuditLogUncheckedCreateWithoutRetailerInput> | AuditLogCreateWithoutRetailerInput[] | AuditLogUncheckedCreateWithoutRetailerInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutRetailerInput | AuditLogCreateOrConnectWithoutRetailerInput[]
    createMany?: AuditLogCreateManyRetailerInputEnvelope
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
  }

  export type PlatformKeyUncheckedCreateNestedOneWithoutRetailerInput = {
    create?: XOR<PlatformKeyCreateWithoutRetailerInput, PlatformKeyUncheckedCreateWithoutRetailerInput>
    connectOrCreate?: PlatformKeyCreateOrConnectWithoutRetailerInput
    connect?: PlatformKeyWhereUniqueInput
  }

  export type AuditLogUncheckedCreateNestedManyWithoutRetailerInput = {
    create?: XOR<AuditLogCreateWithoutRetailerInput, AuditLogUncheckedCreateWithoutRetailerInput> | AuditLogCreateWithoutRetailerInput[] | AuditLogUncheckedCreateWithoutRetailerInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutRetailerInput | AuditLogCreateOrConnectWithoutRetailerInput[]
    createMany?: AuditLogCreateManyRetailerInputEnvelope
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
  }

  export type PlatformKeyUpdateOneWithoutRetailerNestedInput = {
    create?: XOR<PlatformKeyCreateWithoutRetailerInput, PlatformKeyUncheckedCreateWithoutRetailerInput>
    connectOrCreate?: PlatformKeyCreateOrConnectWithoutRetailerInput
    upsert?: PlatformKeyUpsertWithoutRetailerInput
    disconnect?: PlatformKeyWhereInput | boolean
    delete?: PlatformKeyWhereInput | boolean
    connect?: PlatformKeyWhereUniqueInput
    update?: XOR<XOR<PlatformKeyUpdateToOneWithWhereWithoutRetailerInput, PlatformKeyUpdateWithoutRetailerInput>, PlatformKeyUncheckedUpdateWithoutRetailerInput>
  }

  export type AuditLogUpdateManyWithoutRetailerNestedInput = {
    create?: XOR<AuditLogCreateWithoutRetailerInput, AuditLogUncheckedCreateWithoutRetailerInput> | AuditLogCreateWithoutRetailerInput[] | AuditLogUncheckedCreateWithoutRetailerInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutRetailerInput | AuditLogCreateOrConnectWithoutRetailerInput[]
    upsert?: AuditLogUpsertWithWhereUniqueWithoutRetailerInput | AuditLogUpsertWithWhereUniqueWithoutRetailerInput[]
    createMany?: AuditLogCreateManyRetailerInputEnvelope
    set?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    disconnect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    delete?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    update?: AuditLogUpdateWithWhereUniqueWithoutRetailerInput | AuditLogUpdateWithWhereUniqueWithoutRetailerInput[]
    updateMany?: AuditLogUpdateManyWithWhereWithoutRetailerInput | AuditLogUpdateManyWithWhereWithoutRetailerInput[]
    deleteMany?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
  }

  export type PlatformKeyUncheckedUpdateOneWithoutRetailerNestedInput = {
    create?: XOR<PlatformKeyCreateWithoutRetailerInput, PlatformKeyUncheckedCreateWithoutRetailerInput>
    connectOrCreate?: PlatformKeyCreateOrConnectWithoutRetailerInput
    upsert?: PlatformKeyUpsertWithoutRetailerInput
    disconnect?: PlatformKeyWhereInput | boolean
    delete?: PlatformKeyWhereInput | boolean
    connect?: PlatformKeyWhereUniqueInput
    update?: XOR<XOR<PlatformKeyUpdateToOneWithWhereWithoutRetailerInput, PlatformKeyUpdateWithoutRetailerInput>, PlatformKeyUncheckedUpdateWithoutRetailerInput>
  }

  export type AuditLogUncheckedUpdateManyWithoutRetailerNestedInput = {
    create?: XOR<AuditLogCreateWithoutRetailerInput, AuditLogUncheckedCreateWithoutRetailerInput> | AuditLogCreateWithoutRetailerInput[] | AuditLogUncheckedCreateWithoutRetailerInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutRetailerInput | AuditLogCreateOrConnectWithoutRetailerInput[]
    upsert?: AuditLogUpsertWithWhereUniqueWithoutRetailerInput | AuditLogUpsertWithWhereUniqueWithoutRetailerInput[]
    createMany?: AuditLogCreateManyRetailerInputEnvelope
    set?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    disconnect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    delete?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    update?: AuditLogUpdateWithWhereUniqueWithoutRetailerInput | AuditLogUpdateWithWhereUniqueWithoutRetailerInput[]
    updateMany?: AuditLogUpdateManyWithWhereWithoutRetailerInput | AuditLogUpdateManyWithWhereWithoutRetailerInput[]
    deleteMany?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
  }

  export type RetailerCreateNestedOneWithoutPlatformKeyInput = {
    create?: XOR<RetailerCreateWithoutPlatformKeyInput, RetailerUncheckedCreateWithoutPlatformKeyInput>
    connectOrCreate?: RetailerCreateOrConnectWithoutPlatformKeyInput
    connect?: RetailerWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type RetailerUpdateOneRequiredWithoutPlatformKeyNestedInput = {
    create?: XOR<RetailerCreateWithoutPlatformKeyInput, RetailerUncheckedCreateWithoutPlatformKeyInput>
    connectOrCreate?: RetailerCreateOrConnectWithoutPlatformKeyInput
    upsert?: RetailerUpsertWithoutPlatformKeyInput
    connect?: RetailerWhereUniqueInput
    update?: XOR<XOR<RetailerUpdateToOneWithWhereWithoutPlatformKeyInput, RetailerUpdateWithoutPlatformKeyInput>, RetailerUncheckedUpdateWithoutPlatformKeyInput>
  }

  export type RetailerCreateNestedOneWithoutAuditLogsInput = {
    create?: XOR<RetailerCreateWithoutAuditLogsInput, RetailerUncheckedCreateWithoutAuditLogsInput>
    connectOrCreate?: RetailerCreateOrConnectWithoutAuditLogsInput
    connect?: RetailerWhereUniqueInput
  }

  export type RetailerUpdateOneRequiredWithoutAuditLogsNestedInput = {
    create?: XOR<RetailerCreateWithoutAuditLogsInput, RetailerUncheckedCreateWithoutAuditLogsInput>
    connectOrCreate?: RetailerCreateOrConnectWithoutAuditLogsInput
    upsert?: RetailerUpsertWithoutAuditLogsInput
    connect?: RetailerWhereUniqueInput
    update?: XOR<XOR<RetailerUpdateToOneWithWhereWithoutAuditLogsInput, RetailerUpdateWithoutAuditLogsInput>, RetailerUncheckedUpdateWithoutAuditLogsInput>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type PlatformKeyCreateWithoutRetailerInput = {
    key: string
    issuedAt?: Date | string
    revokedAt?: Date | string | null
  }

  export type PlatformKeyUncheckedCreateWithoutRetailerInput = {
    id?: number
    key: string
    issuedAt?: Date | string
    revokedAt?: Date | string | null
  }

  export type PlatformKeyCreateOrConnectWithoutRetailerInput = {
    where: PlatformKeyWhereUniqueInput
    create: XOR<PlatformKeyCreateWithoutRetailerInput, PlatformKeyUncheckedCreateWithoutRetailerInput>
  }

  export type AuditLogCreateWithoutRetailerInput = {
    event: string
    meta?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type AuditLogUncheckedCreateWithoutRetailerInput = {
    id?: number
    event: string
    meta?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type AuditLogCreateOrConnectWithoutRetailerInput = {
    where: AuditLogWhereUniqueInput
    create: XOR<AuditLogCreateWithoutRetailerInput, AuditLogUncheckedCreateWithoutRetailerInput>
  }

  export type AuditLogCreateManyRetailerInputEnvelope = {
    data: AuditLogCreateManyRetailerInput | AuditLogCreateManyRetailerInput[]
    skipDuplicates?: boolean
  }

  export type PlatformKeyUpsertWithoutRetailerInput = {
    update: XOR<PlatformKeyUpdateWithoutRetailerInput, PlatformKeyUncheckedUpdateWithoutRetailerInput>
    create: XOR<PlatformKeyCreateWithoutRetailerInput, PlatformKeyUncheckedCreateWithoutRetailerInput>
    where?: PlatformKeyWhereInput
  }

  export type PlatformKeyUpdateToOneWithWhereWithoutRetailerInput = {
    where?: PlatformKeyWhereInput
    data: XOR<PlatformKeyUpdateWithoutRetailerInput, PlatformKeyUncheckedUpdateWithoutRetailerInput>
  }

  export type PlatformKeyUpdateWithoutRetailerInput = {
    key?: StringFieldUpdateOperationsInput | string
    issuedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PlatformKeyUncheckedUpdateWithoutRetailerInput = {
    id?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    issuedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type AuditLogUpsertWithWhereUniqueWithoutRetailerInput = {
    where: AuditLogWhereUniqueInput
    update: XOR<AuditLogUpdateWithoutRetailerInput, AuditLogUncheckedUpdateWithoutRetailerInput>
    create: XOR<AuditLogCreateWithoutRetailerInput, AuditLogUncheckedCreateWithoutRetailerInput>
  }

  export type AuditLogUpdateWithWhereUniqueWithoutRetailerInput = {
    where: AuditLogWhereUniqueInput
    data: XOR<AuditLogUpdateWithoutRetailerInput, AuditLogUncheckedUpdateWithoutRetailerInput>
  }

  export type AuditLogUpdateManyWithWhereWithoutRetailerInput = {
    where: AuditLogScalarWhereInput
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyWithoutRetailerInput>
  }

  export type AuditLogScalarWhereInput = {
    AND?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
    OR?: AuditLogScalarWhereInput[]
    NOT?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
    id?: IntFilter<"AuditLog"> | number
    retailerId?: IntFilter<"AuditLog"> | number
    event?: StringFilter<"AuditLog"> | string
    meta?: JsonNullableFilter<"AuditLog">
    createdAt?: DateTimeFilter<"AuditLog"> | Date | string
  }

  export type RetailerCreateWithoutPlatformKeyInput = {
    slug: string
    name: string
    contactEmail: string
    mcpServerUrl: string
    businessPermitUrl?: string | null
    verified?: boolean
    active?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    aiProvider?: string | null
    aiApiKey?: string | null
    aiModel?: string | null
    aiSystemPrompt?: string | null
    serperApiKey?: string | null
    telegramNotifyChatId?: string | null
    paymentProvider?: string | null
    paymentApiKey?: string | null
    paymentPublicKey?: string | null
    paymentWebhookSecret?: string | null
    auditLogs?: AuditLogCreateNestedManyWithoutRetailerInput
  }

  export type RetailerUncheckedCreateWithoutPlatformKeyInput = {
    id?: number
    slug: string
    name: string
    contactEmail: string
    mcpServerUrl: string
    businessPermitUrl?: string | null
    verified?: boolean
    active?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    aiProvider?: string | null
    aiApiKey?: string | null
    aiModel?: string | null
    aiSystemPrompt?: string | null
    serperApiKey?: string | null
    telegramNotifyChatId?: string | null
    paymentProvider?: string | null
    paymentApiKey?: string | null
    paymentPublicKey?: string | null
    paymentWebhookSecret?: string | null
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutRetailerInput
  }

  export type RetailerCreateOrConnectWithoutPlatformKeyInput = {
    where: RetailerWhereUniqueInput
    create: XOR<RetailerCreateWithoutPlatformKeyInput, RetailerUncheckedCreateWithoutPlatformKeyInput>
  }

  export type RetailerUpsertWithoutPlatformKeyInput = {
    update: XOR<RetailerUpdateWithoutPlatformKeyInput, RetailerUncheckedUpdateWithoutPlatformKeyInput>
    create: XOR<RetailerCreateWithoutPlatformKeyInput, RetailerUncheckedCreateWithoutPlatformKeyInput>
    where?: RetailerWhereInput
  }

  export type RetailerUpdateToOneWithWhereWithoutPlatformKeyInput = {
    where?: RetailerWhereInput
    data: XOR<RetailerUpdateWithoutPlatformKeyInput, RetailerUncheckedUpdateWithoutPlatformKeyInput>
  }

  export type RetailerUpdateWithoutPlatformKeyInput = {
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    mcpServerUrl?: StringFieldUpdateOperationsInput | string
    businessPermitUrl?: NullableStringFieldUpdateOperationsInput | string | null
    verified?: BoolFieldUpdateOperationsInput | boolean
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    aiProvider?: NullableStringFieldUpdateOperationsInput | string | null
    aiApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    aiSystemPrompt?: NullableStringFieldUpdateOperationsInput | string | null
    serperApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    telegramNotifyChatId?: NullableStringFieldUpdateOperationsInput | string | null
    paymentProvider?: NullableStringFieldUpdateOperationsInput | string | null
    paymentApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    paymentPublicKey?: NullableStringFieldUpdateOperationsInput | string | null
    paymentWebhookSecret?: NullableStringFieldUpdateOperationsInput | string | null
    auditLogs?: AuditLogUpdateManyWithoutRetailerNestedInput
  }

  export type RetailerUncheckedUpdateWithoutPlatformKeyInput = {
    id?: IntFieldUpdateOperationsInput | number
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    mcpServerUrl?: StringFieldUpdateOperationsInput | string
    businessPermitUrl?: NullableStringFieldUpdateOperationsInput | string | null
    verified?: BoolFieldUpdateOperationsInput | boolean
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    aiProvider?: NullableStringFieldUpdateOperationsInput | string | null
    aiApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    aiSystemPrompt?: NullableStringFieldUpdateOperationsInput | string | null
    serperApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    telegramNotifyChatId?: NullableStringFieldUpdateOperationsInput | string | null
    paymentProvider?: NullableStringFieldUpdateOperationsInput | string | null
    paymentApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    paymentPublicKey?: NullableStringFieldUpdateOperationsInput | string | null
    paymentWebhookSecret?: NullableStringFieldUpdateOperationsInput | string | null
    auditLogs?: AuditLogUncheckedUpdateManyWithoutRetailerNestedInput
  }

  export type RetailerCreateWithoutAuditLogsInput = {
    slug: string
    name: string
    contactEmail: string
    mcpServerUrl: string
    businessPermitUrl?: string | null
    verified?: boolean
    active?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    aiProvider?: string | null
    aiApiKey?: string | null
    aiModel?: string | null
    aiSystemPrompt?: string | null
    serperApiKey?: string | null
    telegramNotifyChatId?: string | null
    paymentProvider?: string | null
    paymentApiKey?: string | null
    paymentPublicKey?: string | null
    paymentWebhookSecret?: string | null
    platformKey?: PlatformKeyCreateNestedOneWithoutRetailerInput
  }

  export type RetailerUncheckedCreateWithoutAuditLogsInput = {
    id?: number
    slug: string
    name: string
    contactEmail: string
    mcpServerUrl: string
    businessPermitUrl?: string | null
    verified?: boolean
    active?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    aiProvider?: string | null
    aiApiKey?: string | null
    aiModel?: string | null
    aiSystemPrompt?: string | null
    serperApiKey?: string | null
    telegramNotifyChatId?: string | null
    paymentProvider?: string | null
    paymentApiKey?: string | null
    paymentPublicKey?: string | null
    paymentWebhookSecret?: string | null
    platformKey?: PlatformKeyUncheckedCreateNestedOneWithoutRetailerInput
  }

  export type RetailerCreateOrConnectWithoutAuditLogsInput = {
    where: RetailerWhereUniqueInput
    create: XOR<RetailerCreateWithoutAuditLogsInput, RetailerUncheckedCreateWithoutAuditLogsInput>
  }

  export type RetailerUpsertWithoutAuditLogsInput = {
    update: XOR<RetailerUpdateWithoutAuditLogsInput, RetailerUncheckedUpdateWithoutAuditLogsInput>
    create: XOR<RetailerCreateWithoutAuditLogsInput, RetailerUncheckedCreateWithoutAuditLogsInput>
    where?: RetailerWhereInput
  }

  export type RetailerUpdateToOneWithWhereWithoutAuditLogsInput = {
    where?: RetailerWhereInput
    data: XOR<RetailerUpdateWithoutAuditLogsInput, RetailerUncheckedUpdateWithoutAuditLogsInput>
  }

  export type RetailerUpdateWithoutAuditLogsInput = {
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    mcpServerUrl?: StringFieldUpdateOperationsInput | string
    businessPermitUrl?: NullableStringFieldUpdateOperationsInput | string | null
    verified?: BoolFieldUpdateOperationsInput | boolean
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    aiProvider?: NullableStringFieldUpdateOperationsInput | string | null
    aiApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    aiSystemPrompt?: NullableStringFieldUpdateOperationsInput | string | null
    serperApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    telegramNotifyChatId?: NullableStringFieldUpdateOperationsInput | string | null
    paymentProvider?: NullableStringFieldUpdateOperationsInput | string | null
    paymentApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    paymentPublicKey?: NullableStringFieldUpdateOperationsInput | string | null
    paymentWebhookSecret?: NullableStringFieldUpdateOperationsInput | string | null
    platformKey?: PlatformKeyUpdateOneWithoutRetailerNestedInput
  }

  export type RetailerUncheckedUpdateWithoutAuditLogsInput = {
    id?: IntFieldUpdateOperationsInput | number
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    contactEmail?: StringFieldUpdateOperationsInput | string
    mcpServerUrl?: StringFieldUpdateOperationsInput | string
    businessPermitUrl?: NullableStringFieldUpdateOperationsInput | string | null
    verified?: BoolFieldUpdateOperationsInput | boolean
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    aiProvider?: NullableStringFieldUpdateOperationsInput | string | null
    aiApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    aiModel?: NullableStringFieldUpdateOperationsInput | string | null
    aiSystemPrompt?: NullableStringFieldUpdateOperationsInput | string | null
    serperApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    telegramNotifyChatId?: NullableStringFieldUpdateOperationsInput | string | null
    paymentProvider?: NullableStringFieldUpdateOperationsInput | string | null
    paymentApiKey?: NullableStringFieldUpdateOperationsInput | string | null
    paymentPublicKey?: NullableStringFieldUpdateOperationsInput | string | null
    paymentWebhookSecret?: NullableStringFieldUpdateOperationsInput | string | null
    platformKey?: PlatformKeyUncheckedUpdateOneWithoutRetailerNestedInput
  }

  export type AuditLogCreateManyRetailerInput = {
    id?: number
    event: string
    meta?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type AuditLogUpdateWithoutRetailerInput = {
    event?: StringFieldUpdateOperationsInput | string
    meta?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUncheckedUpdateWithoutRetailerInput = {
    id?: IntFieldUpdateOperationsInput | number
    event?: StringFieldUpdateOperationsInput | string
    meta?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUncheckedUpdateManyWithoutRetailerInput = {
    id?: IntFieldUpdateOperationsInput | number
    event?: StringFieldUpdateOperationsInput | string
    meta?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}