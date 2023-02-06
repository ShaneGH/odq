
import {
  HttpError,
  RootResponseInterceptor,
  KeySelection,
  WithKeyType,
  QueryEnum,
  ODataComplexType,
  ODataTypeRef,
  RequestTools,
  ODataServiceConfig,
  CastSelection,
  SubPathSelection,
  ODataUriParts,
  QueryPrimitive,
  QueryArray,
  EntityQuery,
  QueryComplexObject,
  ODataAnnotatedResult,
  ODataResult,
  SingleItemsCannotBeQueriedByKey,
  ThisItemDoesNotHaveAKey,
  CollectionsCannotBeTraversed,
  PrimitiveTypesCannotBeTraversed,
  CastingOnCollectionsOfCollectionsIsNotSupported,
  QueryingOnCollectionsOfCollectionsIsNotSupported
} from 'odata-ts-client';

import {
      HttpClient as AngularHttpClient,
      HttpResponse as HttpResponse
} from '@angular/common/http'

import {
      Observable,
      mergeMap,
      map,
} from 'rxjs'

// ReSharper disable InconsistentNaming
/* tslint:disable */
/* eslint-disable */

/********************************************************/
/********************************************************/
/****************                        ****************/
/***************   🎉 Auto generated 🎉  ***************/
/***************    by odata-ts-client    ***************/
/***************   ⚠️ Do not modify ⚠️   ***************/
/****************                        ****************/
/********************************************************/
/********************************************************/






const responseParser: RootResponseInterceptor<Observable<HttpResponse<string>>, Observable<any>> = response => {

  return response.pipe(map(x => x.body && JSON.parse(x.body)));
}

function toODataTypeRef(collection: boolean, namespace: string, name: string): ODataTypeRef {
  const collectionType: ODataTypeRef = { isCollection: false, name, namespace }
  return collection ? { isCollection: true, collectionType } : collectionType
}

/**
 * The http client which serves as an entry point to OData
 */
export class ODataClient {
  constructor(private _httpClientArgs: RequestTools<Observable<HttpResponse<string>>, Observable<any>>) { }

  get My() {
    const _httpClientArgs = this._httpClientArgs;
    return {
      get Odata() {
      
        return {
          get Container() {
          
            return {
              get AppDetails() {
                return new EntityQuery<
                  /* TEntity */        My.Odata.Entities.AppDetails,
                  /* TDataResult */    Observable<ODataAnnotatedResult<My.Odata.Entities.AppDetails>>,
                  /* TKeyBuilder */    SingleItemsCannotBeQueriedByKey,
                  /* TQueryable */     My.Odata.Entities.QueryableAppDetails,
                  /* TCaster */        My.Odata.Entities.AppDetailsCaster.Single,
                  /* TSingleCaster */  My.Odata.Entities.AppDetailsCaster.Single,
                  /* TSubPath */       My.Odata.Entities.AppDetailsSubPath,
                  /* TSingleSubPath */ My.Odata.Entities.AppDetailsSubPath,
                  /* TFetchResult */   Observable<HttpResponse<string>>>(_httpClientArgs, responseParser, toODataTypeRef(false, "My.Odata.Entities", "AppDetails"), rootConfig.entitySets["My/Odata.Container"]["AppDetails"], rootConfig);
              },
              
              get AppDetailsBase() {
                return new EntityQuery<
                  /* TEntity */        My.Odata.Entities.AppDetailsBase,
                  /* TDataResult */    Observable<ODataAnnotatedResult<My.Odata.Entities.AppDetailsBase>>,
                  /* TKeyBuilder */    SingleItemsCannotBeQueriedByKey,
                  /* TQueryable */     My.Odata.Entities.QueryableAppDetailsBase,
                  /* TCaster */        My.Odata.Entities.AppDetailsBaseCaster.Single,
                  /* TSingleCaster */  My.Odata.Entities.AppDetailsBaseCaster.Single,
                  /* TSubPath */       My.Odata.Entities.AppDetailsBaseSubPath,
                  /* TSingleSubPath */ My.Odata.Entities.AppDetailsBaseSubPath,
                  /* TFetchResult */   Observable<HttpResponse<string>>>(_httpClientArgs, responseParser, toODataTypeRef(false, "My.Odata.Entities", "AppDetailsBase"), rootConfig.entitySets["My/Odata.Container"]["AppDetailsBase"], rootConfig);
              },
              
              get BlogPosts() {
                return new EntityQuery<
                  /* TEntity */        My.Odata.Entities.BlogPost,
                  /* TDataResult */    Observable<ODataAnnotatedResult<My.Odata.Entities.BlogPost[]>>,
                  /* TKeyBuilder */    My.Odata.Entities.BlogPostKeyBuiler,
                  /* TQueryable */     My.Odata.Entities.QueryableBlogPost,
                  /* TCaster */        My.Odata.Entities.BlogPostCaster.Collection,
                  /* TSingleCaster */  My.Odata.Entities.BlogPostCaster.Single,
                  /* TSubPath */       CollectionsCannotBeTraversed,
                  /* TSingleSubPath */ My.Odata.Entities.BlogPostSubPath,
                  /* TFetchResult */   Observable<HttpResponse<string>>>(_httpClientArgs, responseParser, toODataTypeRef(true, "My.Odata.Entities", "BlogPost"), rootConfig.entitySets["My/Odata.Container"]["BlogPosts"], rootConfig);
              },
              
              get BlogPosts2() {
                return new EntityQuery<
                  /* TEntity */        My.Odata.Entities.BlogPost,
                  /* TDataResult */    Observable<ODataAnnotatedResult<My.Odata.Entities.BlogPost[]>>,
                  /* TKeyBuilder */    My.Odata.Entities.BlogPostKeyBuiler,
                  /* TQueryable */     My.Odata.Entities.QueryableBlogPost,
                  /* TCaster */        My.Odata.Entities.BlogPostCaster.Collection,
                  /* TSingleCaster */  My.Odata.Entities.BlogPostCaster.Single,
                  /* TSubPath */       CollectionsCannotBeTraversed,
                  /* TSingleSubPath */ My.Odata.Entities.BlogPostSubPath,
                  /* TFetchResult */   Observable<HttpResponse<string>>>(_httpClientArgs, responseParser, toODataTypeRef(true, "My.Odata.Entities", "BlogPost"), rootConfig.entitySets["My/Odata.Container"]["BlogPosts2"], rootConfig);
              },
              
              get Blogs() {
                return new EntityQuery<
                  /* TEntity */        My.Odata.Entities.Blog,
                  /* TDataResult */    Observable<ODataAnnotatedResult<My.Odata.Entities.Blog[]>>,
                  /* TKeyBuilder */    My.Odata.Entities.BlogKeyBuiler,
                  /* TQueryable */     My.Odata.Entities.QueryableBlog,
                  /* TCaster */        My.Odata.Entities.BlogCaster.Collection,
                  /* TSingleCaster */  My.Odata.Entities.BlogCaster.Single,
                  /* TSubPath */       CollectionsCannotBeTraversed,
                  /* TSingleSubPath */ My.Odata.Entities.BlogSubPath,
                  /* TFetchResult */   Observable<HttpResponse<string>>>(_httpClientArgs, responseParser, toODataTypeRef(true, "My.Odata.Entities", "Blog"), rootConfig.entitySets["My/Odata.Container"]["Blogs"], rootConfig);
              },
              
              get Comments() {
                return new EntityQuery<
                  /* TEntity */        My.Odata.Entities.Comment,
                  /* TDataResult */    Observable<ODataAnnotatedResult<My.Odata.Entities.Comment[]>>,
                  /* TKeyBuilder */    My.Odata.Entities.CommentKeyBuiler,
                  /* TQueryable */     My.Odata.Entities.QueryableComment,
                  /* TCaster */        My.Odata.Entities.CommentCaster.Collection,
                  /* TSingleCaster */  My.Odata.Entities.CommentCaster.Single,
                  /* TSubPath */       CollectionsCannotBeTraversed,
                  /* TSingleSubPath */ My.Odata.Entities.CommentSubPath,
                  /* TFetchResult */   Observable<HttpResponse<string>>>(_httpClientArgs, responseParser, toODataTypeRef(true, "My.Odata.Entities", "Comment"), rootConfig.entitySets["My/Odata.Container"]["Comments"], rootConfig);
              },
              
              get CompositeKeyItems() {
                return new EntityQuery<
                  /* TEntity */        My.Odata.Entities.CompositeKeyItem,
                  /* TDataResult */    Observable<ODataAnnotatedResult<My.Odata.Entities.CompositeKeyItem[]>>,
                  /* TKeyBuilder */    My.Odata.Entities.CompositeKeyItemKeyBuiler,
                  /* TQueryable */     My.Odata.Entities.QueryableCompositeKeyItem,
                  /* TCaster */        My.Odata.Entities.CompositeKeyItemCaster.Collection,
                  /* TSingleCaster */  My.Odata.Entities.CompositeKeyItemCaster.Single,
                  /* TSubPath */       CollectionsCannotBeTraversed,
                  /* TSingleSubPath */ My.Odata.Entities.CompositeKeyItemSubPath,
                  /* TFetchResult */   Observable<HttpResponse<string>>>(_httpClientArgs, responseParser, toODataTypeRef(true, "My.Odata.Entities", "CompositeKeyItem"), rootConfig.entitySets["My/Odata.Container"]["CompositeKeyItems"], rootConfig);
              },
              
              get HasIds() {
                return new EntityQuery<
                  /* TEntity */        My.Odata.Entities.HasId,
                  /* TDataResult */    Observable<ODataAnnotatedResult<My.Odata.Entities.HasId[]>>,
                  /* TKeyBuilder */    My.Odata.Entities.HasIdKeyBuiler,
                  /* TQueryable */     My.Odata.Entities.QueryableHasId,
                  /* TCaster */        My.Odata.Entities.HasIdCaster.Collection,
                  /* TSingleCaster */  My.Odata.Entities.HasIdCaster.Single,
                  /* TSubPath */       CollectionsCannotBeTraversed,
                  /* TSingleSubPath */ My.Odata.Entities.HasIdSubPath,
                  /* TFetchResult */   Observable<HttpResponse<string>>>(_httpClientArgs, responseParser, toODataTypeRef(true, "My.Odata.Entities", "HasId"), rootConfig.entitySets["My/Odata.Container"]["HasIds"], rootConfig);
              },
              
              get UserProfiles() {
                return new EntityQuery<
                  /* TEntity */        My.Odata.Entities.UserProfile,
                  /* TDataResult */    Observable<ODataAnnotatedResult<My.Odata.Entities.UserProfile[]>>,
                  /* TKeyBuilder */    My.Odata.Entities.UserProfileKeyBuiler,
                  /* TQueryable */     My.Odata.Entities.QueryableUserProfile,
                  /* TCaster */        My.Odata.Entities.UserProfileCaster.Collection,
                  /* TSingleCaster */  My.Odata.Entities.UserProfileCaster.Single,
                  /* TSubPath */       CollectionsCannotBeTraversed,
                  /* TSingleSubPath */ My.Odata.Entities.UserProfileSubPath,
                  /* TFetchResult */   Observable<HttpResponse<string>>>(_httpClientArgs, responseParser, toODataTypeRef(true, "My.Odata.Entities", "UserProfile"), rootConfig.entitySets["My/Odata.Container"]["UserProfiles"], rootConfig);
              },
              
              get UserRoles() {
                return new EntityQuery<
                  /* TEntity */        My.Odata.Entities.UserRole,
                  /* TDataResult */    Observable<ODataAnnotatedResult<My.Odata.Entities.UserRole[]>>,
                  /* TKeyBuilder */    My.Odata.Entities.UserRoleKeyBuiler,
                  /* TQueryable */     My.Odata.Entities.QueryableUserRole,
                  /* TCaster */        My.Odata.Entities.UserRoleCaster.Collection,
                  /* TSingleCaster */  My.Odata.Entities.UserRoleCaster.Single,
                  /* TSubPath */       CollectionsCannotBeTraversed,
                  /* TSingleSubPath */ My.Odata.Entities.UserRoleSubPath,
                  /* TFetchResult */   Observable<HttpResponse<string>>>(_httpClientArgs, responseParser, toODataTypeRef(true, "My.Odata.Entities", "UserRole"), rootConfig.entitySets["My/Odata.Container"]["UserRoles"], rootConfig);
              },
              
              get Users() {
                return new EntityQuery<
                  /* TEntity */        My.Odata.Entities.User,
                  /* TDataResult */    Observable<ODataAnnotatedResult<My.Odata.Entities.User[]>>,
                  /* TKeyBuilder */    My.Odata.Entities.UserKeyBuiler,
                  /* TQueryable */     My.Odata.Entities.QueryableUser,
                  /* TCaster */        My.Odata.Entities.UserCaster.Collection,
                  /* TSingleCaster */  My.Odata.Entities.UserCaster.Single,
                  /* TSubPath */       CollectionsCannotBeTraversed,
                  /* TSingleSubPath */ My.Odata.Entities.UserSubPath,
                  /* TFetchResult */   Observable<HttpResponse<string>>>(_httpClientArgs, responseParser, toODataTypeRef(true, "My.Odata.Entities", "User"), rootConfig.entitySets["My/Odata.Container"]["Users"], rootConfig);
              }
            }
          }
        }
      }
    }
  }
}

/**
 * Entities and complex types from the data model
 */
export module My.Odata.Entities {
  export type AppDetailsBase = {
    Id: Edm.Int32
  }
  
  export type AppDetails = My.Odata.Entities.AppDetailsBase & {
    AppName: Edm.String
    AppNameWords?: Edm.String[]
  }
  
  export type UserProfile = {
    Key: My.Odata.Entities.UserProfileType
    Description: Edm.String
  }
  
  export type UserRole = {
    Key: My.Odata.Entities.UserType
    Description: Edm.String
  }
  
  export type HasId = {
    Id: Edm.String
  }
  
  export type User = My.Odata.Entities.HasId & {
    Name: Edm.String
    UserType: My.Odata.Entities.UserType
    Score: Edm.Double
    UserProfileType: My.Odata.Entities.UserProfileType
    Blogs?: My.Odata.Entities.Blog[]
    BlogPostComments?: My.Odata.Entities.Comment[]
  }
  
  export type Blog = My.Odata.Entities.HasId & {
    Name: Edm.String
    UserId?: Edm.String
    BlogPostNames?: Edm.String[]
    User?: My.Odata.Entities.User
    Posts?: My.Odata.Entities.BlogPost[]
  }
  
  export type BlogPost = My.Odata.Entities.HasId & {
    Name: Edm.String
    Content: Edm.String
    Likes: Edm.Int64
    AgeRestriction?: Edm.Int64
    Date: Edm.DateTimeOffset
    BlogId?: Edm.String
    Words?: Edm.String[]
    Blog?: My.Odata.Entities.Blog
    Comments?: My.Odata.Entities.Comment[]
  }
  
  export type Comment = My.Odata.Entities.HasId & {
    Title: Edm.String
    Text: Edm.String
    BlogPostId?: Edm.String
    UserId?: Edm.String
    Words?: Edm.String[]
    Tags?: My.Odata.Entities.CommentTag[]
    Mood?: My.Odata.Entities.CommentMood
    BlogPost?: My.Odata.Entities.BlogPost
    User?: My.Odata.Entities.User
  }
  
  export type CompositeKeyItem = {
    Id1: Edm.String
    Id2: Edm.Guid
    Data?: Edm.String
  }
  
  export type CommentTag = {
    Tag?: Edm.String
    Comments?: My.Odata.Entities.Comment[]
  }
  
  export type CommentMood = {
    Key?: Edm.String
    Mood: My.Odata.Entities.Mood
    CommentId?: Edm.String
    Comment?: My.Odata.Entities.Comment
  }
  
  export enum UserProfileType {
    Standard = "Standard",
    Advanced = "Advanced"
  }
  
  export enum UserType {
    User = "User",
    Admin = "Admin"
  }
  
  export enum Mood {
    Happy = "Happy",
    Sad = "Sad"
  }
}

/**
 * Helper types for static typing of OData uris.
 */
export module My.Odata.Entities {
  export type QueryableAppDetailsBase = {
    Id: QueryPrimitive<Edm.Int32>
  }
  
  export module AppDetailsBaseCaster {
    export type Single = {
      AppDetails(): CastSelection<EntityQuery<
        /* TEntity */        My.Odata.Entities.AppDetails,
        /* TDataResult */    Observable<ODataResult<My.Odata.Entities.AppDetails>>,
        /* TKeyBuilder */    My.Odata.Entities.AppDetailsKeyBuiler,
        /* TQueryable */     My.Odata.Entities.QueryableAppDetails,
        /* TCaster */        My.Odata.Entities.AppDetailsCaster.Single,
        /* TSingleCaster */  My.Odata.Entities.AppDetailsCaster.Single,
        /* TSubPath */       My.Odata.Entities.AppDetailsSubPath,
        /* TSingleSubPath */ CollectionsCannotBeTraversed,
        /* TFetchResult */   Observable<HttpResponse<string>>>>
    }
  
    export type Collection = {
      AppDetails(): CastSelection<EntityQuery<
        /* TEntity */        My.Odata.Entities.AppDetails,
        /* TDataResult */    Observable<ODataAnnotatedResult<My.Odata.Entities.AppDetails[]>>,
        /* TKeyBuilder */    My.Odata.Entities.AppDetailsKeyBuiler,
        /* TQueryable */     My.Odata.Entities.QueryableAppDetails,
        /* TCaster */        My.Odata.Entities.AppDetailsCaster.Collection,
        /* TSingleCaster */  My.Odata.Entities.AppDetailsCaster.Single,
        /* TSubPath */       CollectionsCannotBeTraversed,
        /* TSingleSubPath */ My.Odata.Entities.AppDetailsSubPath,
        /* TFetchResult */   Observable<HttpResponse<string>>>>
    }
  }
  
  export type AppDetailsBaseSubPath = {
    Id: SubPathSelection<EntityQuery<
      /* TEntity */        Edm.Int32,
      /* TDataResult */    Observable<ODataAnnotatedResult<Edm.Int32>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryPrimitive<Edm.Int32>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       PrimitiveTypesCannotBeTraversed,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
  }
  
  export type AppDetailsBaseKeyBuiler = {
    key(key: Edm.Int32, keyType?: WithKeyType): KeySelection<EntityQuery<
      /* TEntity */        My.Odata.Entities.AppDetailsBase,
      /* TDataResult */    Observable<ODataResult<My.Odata.Entities.AppDetailsBase>>,
      /* TKeyBuilder */    SingleItemsCannotBeQueriedByKey,
      /* TQueryable */     My.Odata.Entities.QueryableAppDetailsBase,
      /* TCaster */        My.Odata.Entities.AppDetailsBaseCaster.Single,
      /* TSingleCaster */  My.Odata.Entities.AppDetailsBaseCaster.Single,
      /* TSubPath */       My.Odata.Entities.AppDetailsBaseSubPath,
      /* TSingleSubPath */ My.Odata.Entities.AppDetailsBaseSubPath,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
  }
  
  export type QueryableAppDetails = My.Odata.Entities.QueryableAppDetailsBase & {
    AppName: QueryPrimitive<Edm.String>
    AppNameWords: QueryArray<QueryPrimitive<Edm.String>, Edm.String>
  }
  
  export module AppDetailsCaster {
    export type Single = { }
  
    export type Collection = { }
  }
  
  export type AppDetailsSubPath = My.Odata.Entities.AppDetailsBaseSubPath & {
    AppName: SubPathSelection<EntityQuery<
      /* TEntity */        Edm.String,
      /* TDataResult */    Observable<ODataAnnotatedResult<Edm.String>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryPrimitive<Edm.String>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       PrimitiveTypesCannotBeTraversed,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    AppNameWords: SubPathSelection<EntityQuery<
      /* TEntity */        Edm.String,
      /* TDataResult */    Observable<ODataAnnotatedResult<Edm.String[]>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryPrimitive<Edm.String>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       CollectionsCannotBeTraversed,
      /* TSingleSubPath */ PrimitiveTypesCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
  }
  
  export type AppDetailsKeyBuiler = {
    key(key: Edm.Int32, keyType?: WithKeyType): KeySelection<EntityQuery<
      /* TEntity */        My.Odata.Entities.AppDetails,
      /* TDataResult */    Observable<ODataResult<My.Odata.Entities.AppDetails>>,
      /* TKeyBuilder */    SingleItemsCannotBeQueriedByKey,
      /* TQueryable */     My.Odata.Entities.QueryableAppDetails,
      /* TCaster */        My.Odata.Entities.AppDetailsCaster.Single,
      /* TSingleCaster */  My.Odata.Entities.AppDetailsCaster.Single,
      /* TSubPath */       My.Odata.Entities.AppDetailsSubPath,
      /* TSingleSubPath */ My.Odata.Entities.AppDetailsSubPath,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
  }
  
  export type QueryableUserProfile = {
    Key: QueryEnum<My.Odata.Entities.QueryableUserProfileType>
    Description: QueryPrimitive<Edm.String>
  }
  
  export module UserProfileCaster {
    export type Single = { }
  
    export type Collection = { }
  }
  
  export type UserProfileSubPath = {
    Key: SubPathSelection<EntityQuery<
      /* TEntity */        My.Odata.Entities.UserProfileType,
      /* TDataResult */    Observable<ODataAnnotatedResult<My.Odata.Entities.UserProfileType>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryEnum<My.Odata.Entities.UserProfileType>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       PrimitiveTypesCannotBeTraversed,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    Description: SubPathSelection<EntityQuery<
      /* TEntity */        Edm.String,
      /* TDataResult */    Observable<ODataAnnotatedResult<Edm.String>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryPrimitive<Edm.String>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       PrimitiveTypesCannotBeTraversed,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
  }
  
  export type UserProfileKeyBuiler = {
    key(key: My.Odata.Entities.UserProfileType, keyType?: WithKeyType): KeySelection<EntityQuery<
      /* TEntity */        My.Odata.Entities.UserProfile,
      /* TDataResult */    Observable<ODataResult<My.Odata.Entities.UserProfile>>,
      /* TKeyBuilder */    SingleItemsCannotBeQueriedByKey,
      /* TQueryable */     My.Odata.Entities.QueryableUserProfile,
      /* TCaster */        My.Odata.Entities.UserProfileCaster.Single,
      /* TSingleCaster */  My.Odata.Entities.UserProfileCaster.Single,
      /* TSubPath */       My.Odata.Entities.UserProfileSubPath,
      /* TSingleSubPath */ My.Odata.Entities.UserProfileSubPath,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
  }
  
  export type QueryableUserRole = {
    Key: QueryEnum<My.Odata.Entities.QueryableUserType>
    Description: QueryPrimitive<Edm.String>
  }
  
  export module UserRoleCaster {
    export type Single = { }
  
    export type Collection = { }
  }
  
  export type UserRoleSubPath = {
    Key: SubPathSelection<EntityQuery<
      /* TEntity */        My.Odata.Entities.UserType,
      /* TDataResult */    Observable<ODataAnnotatedResult<My.Odata.Entities.UserType>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryEnum<My.Odata.Entities.UserType>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       PrimitiveTypesCannotBeTraversed,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    Description: SubPathSelection<EntityQuery<
      /* TEntity */        Edm.String,
      /* TDataResult */    Observable<ODataAnnotatedResult<Edm.String>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryPrimitive<Edm.String>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       PrimitiveTypesCannotBeTraversed,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
  }
  
  export type UserRoleKeyBuiler = {
    key(key: My.Odata.Entities.UserType, keyType?: WithKeyType): KeySelection<EntityQuery<
      /* TEntity */        My.Odata.Entities.UserRole,
      /* TDataResult */    Observable<ODataResult<My.Odata.Entities.UserRole>>,
      /* TKeyBuilder */    SingleItemsCannotBeQueriedByKey,
      /* TQueryable */     My.Odata.Entities.QueryableUserRole,
      /* TCaster */        My.Odata.Entities.UserRoleCaster.Single,
      /* TSingleCaster */  My.Odata.Entities.UserRoleCaster.Single,
      /* TSubPath */       My.Odata.Entities.UserRoleSubPath,
      /* TSingleSubPath */ My.Odata.Entities.UserRoleSubPath,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
  }
  
  export type QueryableHasId = {
    Id: QueryPrimitive<Edm.String>
  }
  
  export module HasIdCaster {
    export type Single = {
      User(): CastSelection<EntityQuery<
        /* TEntity */        My.Odata.Entities.User,
        /* TDataResult */    Observable<ODataResult<My.Odata.Entities.User>>,
        /* TKeyBuilder */    My.Odata.Entities.UserKeyBuiler,
        /* TQueryable */     My.Odata.Entities.QueryableUser,
        /* TCaster */        My.Odata.Entities.UserCaster.Single,
        /* TSingleCaster */  My.Odata.Entities.UserCaster.Single,
        /* TSubPath */       My.Odata.Entities.UserSubPath,
        /* TSingleSubPath */ CollectionsCannotBeTraversed,
        /* TFetchResult */   Observable<HttpResponse<string>>>>
      
      Blog(): CastSelection<EntityQuery<
        /* TEntity */        My.Odata.Entities.Blog,
        /* TDataResult */    Observable<ODataResult<My.Odata.Entities.Blog>>,
        /* TKeyBuilder */    My.Odata.Entities.BlogKeyBuiler,
        /* TQueryable */     My.Odata.Entities.QueryableBlog,
        /* TCaster */        My.Odata.Entities.BlogCaster.Single,
        /* TSingleCaster */  My.Odata.Entities.BlogCaster.Single,
        /* TSubPath */       My.Odata.Entities.BlogSubPath,
        /* TSingleSubPath */ CollectionsCannotBeTraversed,
        /* TFetchResult */   Observable<HttpResponse<string>>>>
      
      BlogPost(): CastSelection<EntityQuery<
        /* TEntity */        My.Odata.Entities.BlogPost,
        /* TDataResult */    Observable<ODataResult<My.Odata.Entities.BlogPost>>,
        /* TKeyBuilder */    My.Odata.Entities.BlogPostKeyBuiler,
        /* TQueryable */     My.Odata.Entities.QueryableBlogPost,
        /* TCaster */        My.Odata.Entities.BlogPostCaster.Single,
        /* TSingleCaster */  My.Odata.Entities.BlogPostCaster.Single,
        /* TSubPath */       My.Odata.Entities.BlogPostSubPath,
        /* TSingleSubPath */ CollectionsCannotBeTraversed,
        /* TFetchResult */   Observable<HttpResponse<string>>>>
      
      Comment(): CastSelection<EntityQuery<
        /* TEntity */        My.Odata.Entities.Comment,
        /* TDataResult */    Observable<ODataResult<My.Odata.Entities.Comment>>,
        /* TKeyBuilder */    My.Odata.Entities.CommentKeyBuiler,
        /* TQueryable */     My.Odata.Entities.QueryableComment,
        /* TCaster */        My.Odata.Entities.CommentCaster.Single,
        /* TSingleCaster */  My.Odata.Entities.CommentCaster.Single,
        /* TSubPath */       My.Odata.Entities.CommentSubPath,
        /* TSingleSubPath */ CollectionsCannotBeTraversed,
        /* TFetchResult */   Observable<HttpResponse<string>>>>
    }
  
    export type Collection = {
      User(): CastSelection<EntityQuery<
        /* TEntity */        My.Odata.Entities.User,
        /* TDataResult */    Observable<ODataAnnotatedResult<My.Odata.Entities.User[]>>,
        /* TKeyBuilder */    My.Odata.Entities.UserKeyBuiler,
        /* TQueryable */     My.Odata.Entities.QueryableUser,
        /* TCaster */        My.Odata.Entities.UserCaster.Collection,
        /* TSingleCaster */  My.Odata.Entities.UserCaster.Single,
        /* TSubPath */       CollectionsCannotBeTraversed,
        /* TSingleSubPath */ My.Odata.Entities.UserSubPath,
        /* TFetchResult */   Observable<HttpResponse<string>>>>
      
      Blog(): CastSelection<EntityQuery<
        /* TEntity */        My.Odata.Entities.Blog,
        /* TDataResult */    Observable<ODataAnnotatedResult<My.Odata.Entities.Blog[]>>,
        /* TKeyBuilder */    My.Odata.Entities.BlogKeyBuiler,
        /* TQueryable */     My.Odata.Entities.QueryableBlog,
        /* TCaster */        My.Odata.Entities.BlogCaster.Collection,
        /* TSingleCaster */  My.Odata.Entities.BlogCaster.Single,
        /* TSubPath */       CollectionsCannotBeTraversed,
        /* TSingleSubPath */ My.Odata.Entities.BlogSubPath,
        /* TFetchResult */   Observable<HttpResponse<string>>>>
      
      BlogPost(): CastSelection<EntityQuery<
        /* TEntity */        My.Odata.Entities.BlogPost,
        /* TDataResult */    Observable<ODataAnnotatedResult<My.Odata.Entities.BlogPost[]>>,
        /* TKeyBuilder */    My.Odata.Entities.BlogPostKeyBuiler,
        /* TQueryable */     My.Odata.Entities.QueryableBlogPost,
        /* TCaster */        My.Odata.Entities.BlogPostCaster.Collection,
        /* TSingleCaster */  My.Odata.Entities.BlogPostCaster.Single,
        /* TSubPath */       CollectionsCannotBeTraversed,
        /* TSingleSubPath */ My.Odata.Entities.BlogPostSubPath,
        /* TFetchResult */   Observable<HttpResponse<string>>>>
      
      Comment(): CastSelection<EntityQuery<
        /* TEntity */        My.Odata.Entities.Comment,
        /* TDataResult */    Observable<ODataAnnotatedResult<My.Odata.Entities.Comment[]>>,
        /* TKeyBuilder */    My.Odata.Entities.CommentKeyBuiler,
        /* TQueryable */     My.Odata.Entities.QueryableComment,
        /* TCaster */        My.Odata.Entities.CommentCaster.Collection,
        /* TSingleCaster */  My.Odata.Entities.CommentCaster.Single,
        /* TSubPath */       CollectionsCannotBeTraversed,
        /* TSingleSubPath */ My.Odata.Entities.CommentSubPath,
        /* TFetchResult */   Observable<HttpResponse<string>>>>
    }
  }
  
  export type HasIdSubPath = {
    Id: SubPathSelection<EntityQuery<
      /* TEntity */        Edm.String,
      /* TDataResult */    Observable<ODataAnnotatedResult<Edm.String>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryPrimitive<Edm.String>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       PrimitiveTypesCannotBeTraversed,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
  }
  
  export type HasIdKeyBuiler = {
    key(key: Edm.String, keyType?: WithKeyType): KeySelection<EntityQuery<
      /* TEntity */        My.Odata.Entities.HasId,
      /* TDataResult */    Observable<ODataResult<My.Odata.Entities.HasId>>,
      /* TKeyBuilder */    SingleItemsCannotBeQueriedByKey,
      /* TQueryable */     My.Odata.Entities.QueryableHasId,
      /* TCaster */        My.Odata.Entities.HasIdCaster.Single,
      /* TSingleCaster */  My.Odata.Entities.HasIdCaster.Single,
      /* TSubPath */       My.Odata.Entities.HasIdSubPath,
      /* TSingleSubPath */ My.Odata.Entities.HasIdSubPath,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
  }
  
  export type QueryableUser = My.Odata.Entities.QueryableHasId & {
    Name: QueryPrimitive<Edm.String>
    UserType: QueryEnum<My.Odata.Entities.QueryableUserType>
    Score: QueryPrimitive<Edm.Double>
    UserProfileType: QueryEnum<My.Odata.Entities.QueryableUserProfileType>
    Blogs: QueryArray<QueryComplexObject<My.Odata.Entities.QueryableBlog>, My.Odata.Entities.QueryableBlog>
    BlogPostComments: QueryArray<QueryComplexObject<My.Odata.Entities.QueryableComment>, My.Odata.Entities.QueryableComment>
  }
  
  export module UserCaster {
    export type Single = { }
  
    export type Collection = { }
  }
  
  export type UserSubPath = My.Odata.Entities.HasIdSubPath & {
    Name: SubPathSelection<EntityQuery<
      /* TEntity */        Edm.String,
      /* TDataResult */    Observable<ODataAnnotatedResult<Edm.String>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryPrimitive<Edm.String>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       PrimitiveTypesCannotBeTraversed,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    UserType: SubPathSelection<EntityQuery<
      /* TEntity */        My.Odata.Entities.UserType,
      /* TDataResult */    Observable<ODataAnnotatedResult<My.Odata.Entities.UserType>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryEnum<My.Odata.Entities.UserType>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       PrimitiveTypesCannotBeTraversed,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    Score: SubPathSelection<EntityQuery<
      /* TEntity */        Edm.Double,
      /* TDataResult */    Observable<ODataAnnotatedResult<Edm.Double>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryPrimitive<Edm.Double>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       PrimitiveTypesCannotBeTraversed,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    UserProfileType: SubPathSelection<EntityQuery<
      /* TEntity */        My.Odata.Entities.UserProfileType,
      /* TDataResult */    Observable<ODataAnnotatedResult<My.Odata.Entities.UserProfileType>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryEnum<My.Odata.Entities.UserProfileType>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       PrimitiveTypesCannotBeTraversed,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    Blogs: SubPathSelection<EntityQuery<
      /* TEntity */        My.Odata.Entities.Blog,
      /* TDataResult */    Observable<ODataAnnotatedResult<My.Odata.Entities.Blog[]>>,
      /* TKeyBuilder */    My.Odata.Entities.BlogKeyBuiler,
      /* TQueryable */     My.Odata.Entities.QueryableBlog,
      /* TCaster */        My.Odata.Entities.BlogCaster.Collection,
      /* TSingleCaster */  My.Odata.Entities.BlogCaster.Single,
      /* TSubPath */       CollectionsCannotBeTraversed,
      /* TSingleSubPath */ My.Odata.Entities.BlogSubPath,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    BlogPostComments: SubPathSelection<EntityQuery<
      /* TEntity */        My.Odata.Entities.Comment,
      /* TDataResult */    Observable<ODataAnnotatedResult<My.Odata.Entities.Comment[]>>,
      /* TKeyBuilder */    My.Odata.Entities.CommentKeyBuiler,
      /* TQueryable */     My.Odata.Entities.QueryableComment,
      /* TCaster */        My.Odata.Entities.CommentCaster.Collection,
      /* TSingleCaster */  My.Odata.Entities.CommentCaster.Single,
      /* TSubPath */       CollectionsCannotBeTraversed,
      /* TSingleSubPath */ My.Odata.Entities.CommentSubPath,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
  }
  
  export type UserKeyBuiler = {
    key(key: Edm.String, keyType?: WithKeyType): KeySelection<EntityQuery<
      /* TEntity */        My.Odata.Entities.User,
      /* TDataResult */    Observable<ODataResult<My.Odata.Entities.User>>,
      /* TKeyBuilder */    SingleItemsCannotBeQueriedByKey,
      /* TQueryable */     My.Odata.Entities.QueryableUser,
      /* TCaster */        My.Odata.Entities.UserCaster.Single,
      /* TSingleCaster */  My.Odata.Entities.UserCaster.Single,
      /* TSubPath */       My.Odata.Entities.UserSubPath,
      /* TSingleSubPath */ My.Odata.Entities.UserSubPath,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
  }
  
  export type QueryableBlog = My.Odata.Entities.QueryableHasId & {
    Name: QueryPrimitive<Edm.String>
    UserId: QueryPrimitive<Edm.String>
    BlogPostNames: QueryArray<QueryPrimitive<Edm.String>, Edm.String>
    User: QueryComplexObject<My.Odata.Entities.QueryableUser>
    Posts: QueryArray<QueryComplexObject<My.Odata.Entities.QueryableBlogPost>, My.Odata.Entities.QueryableBlogPost>
  }
  
  export module BlogCaster {
    export type Single = { }
  
    export type Collection = { }
  }
  
  export type BlogSubPath = My.Odata.Entities.HasIdSubPath & {
    Name: SubPathSelection<EntityQuery<
      /* TEntity */        Edm.String,
      /* TDataResult */    Observable<ODataAnnotatedResult<Edm.String>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryPrimitive<Edm.String>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       PrimitiveTypesCannotBeTraversed,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    UserId: SubPathSelection<EntityQuery<
      /* TEntity */        Edm.String,
      /* TDataResult */    Observable<ODataAnnotatedResult<Edm.String>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryPrimitive<Edm.String>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       PrimitiveTypesCannotBeTraversed,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    BlogPostNames: SubPathSelection<EntityQuery<
      /* TEntity */        Edm.String,
      /* TDataResult */    Observable<ODataAnnotatedResult<Edm.String[]>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryPrimitive<Edm.String>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       CollectionsCannotBeTraversed,
      /* TSingleSubPath */ PrimitiveTypesCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    User: SubPathSelection<EntityQuery<
      /* TEntity */        My.Odata.Entities.User,
      /* TDataResult */    Observable<ODataResult<My.Odata.Entities.User>>,
      /* TKeyBuilder */    SingleItemsCannotBeQueriedByKey,
      /* TQueryable */     My.Odata.Entities.QueryableUser,
      /* TCaster */        My.Odata.Entities.UserCaster.Single,
      /* TSingleCaster */  My.Odata.Entities.UserCaster.Single,
      /* TSubPath */       My.Odata.Entities.UserSubPath,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    Posts: SubPathSelection<EntityQuery<
      /* TEntity */        My.Odata.Entities.BlogPost,
      /* TDataResult */    Observable<ODataAnnotatedResult<My.Odata.Entities.BlogPost[]>>,
      /* TKeyBuilder */    My.Odata.Entities.BlogPostKeyBuiler,
      /* TQueryable */     My.Odata.Entities.QueryableBlogPost,
      /* TCaster */        My.Odata.Entities.BlogPostCaster.Collection,
      /* TSingleCaster */  My.Odata.Entities.BlogPostCaster.Single,
      /* TSubPath */       CollectionsCannotBeTraversed,
      /* TSingleSubPath */ My.Odata.Entities.BlogPostSubPath,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
  }
  
  export type BlogKeyBuiler = {
    key(key: Edm.String, keyType?: WithKeyType): KeySelection<EntityQuery<
      /* TEntity */        My.Odata.Entities.Blog,
      /* TDataResult */    Observable<ODataResult<My.Odata.Entities.Blog>>,
      /* TKeyBuilder */    SingleItemsCannotBeQueriedByKey,
      /* TQueryable */     My.Odata.Entities.QueryableBlog,
      /* TCaster */        My.Odata.Entities.BlogCaster.Single,
      /* TSingleCaster */  My.Odata.Entities.BlogCaster.Single,
      /* TSubPath */       My.Odata.Entities.BlogSubPath,
      /* TSingleSubPath */ My.Odata.Entities.BlogSubPath,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
  }
  
  export type QueryableBlogPost = My.Odata.Entities.QueryableHasId & {
    Name: QueryPrimitive<Edm.String>
    Content: QueryPrimitive<Edm.String>
    Likes: QueryPrimitive<Edm.Int64>
    AgeRestriction: QueryPrimitive<Edm.Int64>
    Date: QueryPrimitive<Edm.DateTimeOffset>
    BlogId: QueryPrimitive<Edm.String>
    Words: QueryArray<QueryPrimitive<Edm.String>, Edm.String>
    Blog: QueryComplexObject<My.Odata.Entities.QueryableBlog>
    Comments: QueryArray<QueryComplexObject<My.Odata.Entities.QueryableComment>, My.Odata.Entities.QueryableComment>
  }
  
  export module BlogPostCaster {
    export type Single = { }
  
    export type Collection = { }
  }
  
  export type BlogPostSubPath = My.Odata.Entities.HasIdSubPath & {
    Name: SubPathSelection<EntityQuery<
      /* TEntity */        Edm.String,
      /* TDataResult */    Observable<ODataAnnotatedResult<Edm.String>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryPrimitive<Edm.String>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       PrimitiveTypesCannotBeTraversed,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    Content: SubPathSelection<EntityQuery<
      /* TEntity */        Edm.String,
      /* TDataResult */    Observable<ODataAnnotatedResult<Edm.String>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryPrimitive<Edm.String>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       PrimitiveTypesCannotBeTraversed,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    Likes: SubPathSelection<EntityQuery<
      /* TEntity */        Edm.Int64,
      /* TDataResult */    Observable<ODataAnnotatedResult<Edm.Int64>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryPrimitive<Edm.Int64>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       PrimitiveTypesCannotBeTraversed,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    AgeRestriction: SubPathSelection<EntityQuery<
      /* TEntity */        Edm.Int64,
      /* TDataResult */    Observable<ODataAnnotatedResult<Edm.Int64>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryPrimitive<Edm.Int64>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       PrimitiveTypesCannotBeTraversed,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    Date: SubPathSelection<EntityQuery<
      /* TEntity */        Edm.DateTimeOffset,
      /* TDataResult */    Observable<ODataAnnotatedResult<Edm.DateTimeOffset>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryPrimitive<Edm.DateTimeOffset>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       PrimitiveTypesCannotBeTraversed,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    BlogId: SubPathSelection<EntityQuery<
      /* TEntity */        Edm.String,
      /* TDataResult */    Observable<ODataAnnotatedResult<Edm.String>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryPrimitive<Edm.String>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       PrimitiveTypesCannotBeTraversed,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    Words: SubPathSelection<EntityQuery<
      /* TEntity */        Edm.String,
      /* TDataResult */    Observable<ODataAnnotatedResult<Edm.String[]>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryPrimitive<Edm.String>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       CollectionsCannotBeTraversed,
      /* TSingleSubPath */ PrimitiveTypesCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    Blog: SubPathSelection<EntityQuery<
      /* TEntity */        My.Odata.Entities.Blog,
      /* TDataResult */    Observable<ODataResult<My.Odata.Entities.Blog>>,
      /* TKeyBuilder */    SingleItemsCannotBeQueriedByKey,
      /* TQueryable */     My.Odata.Entities.QueryableBlog,
      /* TCaster */        My.Odata.Entities.BlogCaster.Single,
      /* TSingleCaster */  My.Odata.Entities.BlogCaster.Single,
      /* TSubPath */       My.Odata.Entities.BlogSubPath,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    Comments: SubPathSelection<EntityQuery<
      /* TEntity */        My.Odata.Entities.Comment,
      /* TDataResult */    Observable<ODataAnnotatedResult<My.Odata.Entities.Comment[]>>,
      /* TKeyBuilder */    My.Odata.Entities.CommentKeyBuiler,
      /* TQueryable */     My.Odata.Entities.QueryableComment,
      /* TCaster */        My.Odata.Entities.CommentCaster.Collection,
      /* TSingleCaster */  My.Odata.Entities.CommentCaster.Single,
      /* TSubPath */       CollectionsCannotBeTraversed,
      /* TSingleSubPath */ My.Odata.Entities.CommentSubPath,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
  }
  
  export type BlogPostKeyBuiler = {
    key(key: Edm.String, keyType?: WithKeyType): KeySelection<EntityQuery<
      /* TEntity */        My.Odata.Entities.BlogPost,
      /* TDataResult */    Observable<ODataResult<My.Odata.Entities.BlogPost>>,
      /* TKeyBuilder */    SingleItemsCannotBeQueriedByKey,
      /* TQueryable */     My.Odata.Entities.QueryableBlogPost,
      /* TCaster */        My.Odata.Entities.BlogPostCaster.Single,
      /* TSingleCaster */  My.Odata.Entities.BlogPostCaster.Single,
      /* TSubPath */       My.Odata.Entities.BlogPostSubPath,
      /* TSingleSubPath */ My.Odata.Entities.BlogPostSubPath,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
  }
  
  export type QueryableComment = My.Odata.Entities.QueryableHasId & {
    Title: QueryPrimitive<Edm.String>
    Text: QueryPrimitive<Edm.String>
    BlogPostId: QueryPrimitive<Edm.String>
    UserId: QueryPrimitive<Edm.String>
    Words: QueryArray<QueryPrimitive<Edm.String>, Edm.String>
    Tags: QueryArray<QueryComplexObject<My.Odata.Entities.QueryableCommentTag>, My.Odata.Entities.QueryableCommentTag>
    Mood: QueryComplexObject<My.Odata.Entities.QueryableCommentMood>
    BlogPost: QueryComplexObject<My.Odata.Entities.QueryableBlogPost>
    User: QueryComplexObject<My.Odata.Entities.QueryableUser>
  }
  
  export module CommentCaster {
    export type Single = { }
  
    export type Collection = { }
  }
  
  export type CommentSubPath = My.Odata.Entities.HasIdSubPath & {
    Title: SubPathSelection<EntityQuery<
      /* TEntity */        Edm.String,
      /* TDataResult */    Observable<ODataAnnotatedResult<Edm.String>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryPrimitive<Edm.String>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       PrimitiveTypesCannotBeTraversed,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    Text: SubPathSelection<EntityQuery<
      /* TEntity */        Edm.String,
      /* TDataResult */    Observable<ODataAnnotatedResult<Edm.String>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryPrimitive<Edm.String>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       PrimitiveTypesCannotBeTraversed,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    BlogPostId: SubPathSelection<EntityQuery<
      /* TEntity */        Edm.String,
      /* TDataResult */    Observable<ODataAnnotatedResult<Edm.String>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryPrimitive<Edm.String>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       PrimitiveTypesCannotBeTraversed,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    UserId: SubPathSelection<EntityQuery<
      /* TEntity */        Edm.String,
      /* TDataResult */    Observable<ODataAnnotatedResult<Edm.String>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryPrimitive<Edm.String>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       PrimitiveTypesCannotBeTraversed,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    Words: SubPathSelection<EntityQuery<
      /* TEntity */        Edm.String,
      /* TDataResult */    Observable<ODataAnnotatedResult<Edm.String[]>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryPrimitive<Edm.String>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       CollectionsCannotBeTraversed,
      /* TSingleSubPath */ PrimitiveTypesCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    Tags: SubPathSelection<EntityQuery<
      /* TEntity */        My.Odata.Entities.CommentTag,
      /* TDataResult */    Observable<ODataAnnotatedResult<My.Odata.Entities.CommentTag[]>>,
      /* TKeyBuilder */    My.Odata.Entities.CommentTagKeyBuiler,
      /* TQueryable */     My.Odata.Entities.QueryableCommentTag,
      /* TCaster */        My.Odata.Entities.CommentTagCaster.Collection,
      /* TSingleCaster */  My.Odata.Entities.CommentTagCaster.Single,
      /* TSubPath */       CollectionsCannotBeTraversed,
      /* TSingleSubPath */ My.Odata.Entities.CommentTagSubPath,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    Mood: SubPathSelection<EntityQuery<
      /* TEntity */        My.Odata.Entities.CommentMood,
      /* TDataResult */    Observable<ODataResult<My.Odata.Entities.CommentMood>>,
      /* TKeyBuilder */    SingleItemsCannotBeQueriedByKey,
      /* TQueryable */     My.Odata.Entities.QueryableCommentMood,
      /* TCaster */        My.Odata.Entities.CommentMoodCaster.Single,
      /* TSingleCaster */  My.Odata.Entities.CommentMoodCaster.Single,
      /* TSubPath */       My.Odata.Entities.CommentMoodSubPath,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    BlogPost: SubPathSelection<EntityQuery<
      /* TEntity */        My.Odata.Entities.BlogPost,
      /* TDataResult */    Observable<ODataResult<My.Odata.Entities.BlogPost>>,
      /* TKeyBuilder */    SingleItemsCannotBeQueriedByKey,
      /* TQueryable */     My.Odata.Entities.QueryableBlogPost,
      /* TCaster */        My.Odata.Entities.BlogPostCaster.Single,
      /* TSingleCaster */  My.Odata.Entities.BlogPostCaster.Single,
      /* TSubPath */       My.Odata.Entities.BlogPostSubPath,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    User: SubPathSelection<EntityQuery<
      /* TEntity */        My.Odata.Entities.User,
      /* TDataResult */    Observable<ODataResult<My.Odata.Entities.User>>,
      /* TKeyBuilder */    SingleItemsCannotBeQueriedByKey,
      /* TQueryable */     My.Odata.Entities.QueryableUser,
      /* TCaster */        My.Odata.Entities.UserCaster.Single,
      /* TSingleCaster */  My.Odata.Entities.UserCaster.Single,
      /* TSubPath */       My.Odata.Entities.UserSubPath,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
  }
  
  export type CommentKeyBuiler = {
    key(key: Edm.String, keyType?: WithKeyType): KeySelection<EntityQuery<
      /* TEntity */        My.Odata.Entities.Comment,
      /* TDataResult */    Observable<ODataResult<My.Odata.Entities.Comment>>,
      /* TKeyBuilder */    SingleItemsCannotBeQueriedByKey,
      /* TQueryable */     My.Odata.Entities.QueryableComment,
      /* TCaster */        My.Odata.Entities.CommentCaster.Single,
      /* TSingleCaster */  My.Odata.Entities.CommentCaster.Single,
      /* TSubPath */       My.Odata.Entities.CommentSubPath,
      /* TSingleSubPath */ My.Odata.Entities.CommentSubPath,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
  }
  
  export type QueryableCompositeKeyItem = {
    Id1: QueryPrimitive<Edm.String>
    Id2: QueryPrimitive<Edm.Guid>
    Data: QueryPrimitive<Edm.String>
  }
  
  export module CompositeKeyItemCaster {
    export type Single = { }
  
    export type Collection = { }
  }
  
  export type CompositeKeyItemSubPath = {
    Id1: SubPathSelection<EntityQuery<
      /* TEntity */        Edm.String,
      /* TDataResult */    Observable<ODataAnnotatedResult<Edm.String>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryPrimitive<Edm.String>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       PrimitiveTypesCannotBeTraversed,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    Id2: SubPathSelection<EntityQuery<
      /* TEntity */        Edm.Guid,
      /* TDataResult */    Observable<ODataAnnotatedResult<Edm.Guid>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryPrimitive<Edm.Guid>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       PrimitiveTypesCannotBeTraversed,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    Data: SubPathSelection<EntityQuery<
      /* TEntity */        Edm.String,
      /* TDataResult */    Observable<ODataAnnotatedResult<Edm.String>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryPrimitive<Edm.String>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       PrimitiveTypesCannotBeTraversed,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
  }
  
  export type CompositeKeyItemKeyBuiler = {
    key(key: { Id1: Edm.String, Id2: Edm.Guid }, keyType?: WithKeyType): KeySelection<EntityQuery<
      /* TEntity */        My.Odata.Entities.CompositeKeyItem,
      /* TDataResult */    Observable<ODataResult<My.Odata.Entities.CompositeKeyItem>>,
      /* TKeyBuilder */    SingleItemsCannotBeQueriedByKey,
      /* TQueryable */     My.Odata.Entities.QueryableCompositeKeyItem,
      /* TCaster */        My.Odata.Entities.CompositeKeyItemCaster.Single,
      /* TSingleCaster */  My.Odata.Entities.CompositeKeyItemCaster.Single,
      /* TSubPath */       My.Odata.Entities.CompositeKeyItemSubPath,
      /* TSingleSubPath */ My.Odata.Entities.CompositeKeyItemSubPath,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
  }
  
  export type QueryableCommentTag = {
    Tag: QueryPrimitive<Edm.String>
    Comments: QueryArray<QueryComplexObject<My.Odata.Entities.QueryableComment>, My.Odata.Entities.QueryableComment>
  }
  
  export module CommentTagCaster {
    export type Single = { }
  
    export type Collection = { }
  }
  
  export type CommentTagSubPath = {
    Tag: SubPathSelection<EntityQuery<
      /* TEntity */        Edm.String,
      /* TDataResult */    Observable<ODataAnnotatedResult<Edm.String>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryPrimitive<Edm.String>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       PrimitiveTypesCannotBeTraversed,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    Comments: SubPathSelection<EntityQuery<
      /* TEntity */        My.Odata.Entities.Comment,
      /* TDataResult */    Observable<ODataAnnotatedResult<My.Odata.Entities.Comment[]>>,
      /* TKeyBuilder */    My.Odata.Entities.CommentKeyBuiler,
      /* TQueryable */     My.Odata.Entities.QueryableComment,
      /* TCaster */        My.Odata.Entities.CommentCaster.Collection,
      /* TSingleCaster */  My.Odata.Entities.CommentCaster.Single,
      /* TSubPath */       CollectionsCannotBeTraversed,
      /* TSingleSubPath */ My.Odata.Entities.CommentSubPath,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
  }
  
  export type CommentTagKeyBuiler = {
    key(key: ThisItemDoesNotHaveAKey, keyType?: WithKeyType): KeySelection<EntityQuery<
      /* TEntity */        My.Odata.Entities.CommentTag,
      /* TDataResult */    Observable<ODataResult<My.Odata.Entities.CommentTag>>,
      /* TKeyBuilder */    SingleItemsCannotBeQueriedByKey,
      /* TQueryable */     My.Odata.Entities.QueryableCommentTag,
      /* TCaster */        My.Odata.Entities.CommentTagCaster.Single,
      /* TSingleCaster */  My.Odata.Entities.CommentTagCaster.Single,
      /* TSubPath */       My.Odata.Entities.CommentTagSubPath,
      /* TSingleSubPath */ My.Odata.Entities.CommentTagSubPath,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
  }
  
  export type QueryableCommentMood = {
    Key: QueryPrimitive<Edm.String>
    Mood: QueryEnum<My.Odata.Entities.QueryableMood>
    CommentId: QueryPrimitive<Edm.String>
    Comment: QueryComplexObject<My.Odata.Entities.QueryableComment>
  }
  
  export module CommentMoodCaster {
    export type Single = { }
  
    export type Collection = { }
  }
  
  export type CommentMoodSubPath = {
    Key: SubPathSelection<EntityQuery<
      /* TEntity */        Edm.String,
      /* TDataResult */    Observable<ODataAnnotatedResult<Edm.String>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryPrimitive<Edm.String>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       PrimitiveTypesCannotBeTraversed,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    Mood: SubPathSelection<EntityQuery<
      /* TEntity */        My.Odata.Entities.Mood,
      /* TDataResult */    Observable<ODataAnnotatedResult<My.Odata.Entities.Mood>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryEnum<My.Odata.Entities.Mood>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       PrimitiveTypesCannotBeTraversed,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    CommentId: SubPathSelection<EntityQuery<
      /* TEntity */        Edm.String,
      /* TDataResult */    Observable<ODataAnnotatedResult<Edm.String>>,
      /* TKeyBuilder */    ThisItemDoesNotHaveAKey,
      /* TQueryable */     QueryPrimitive<Edm.String>,
      /* TCaster */        CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSingleCaster */  CastingOnCollectionsOfCollectionsIsNotSupported,
      /* TSubPath */       PrimitiveTypesCannotBeTraversed,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
    
    Comment: SubPathSelection<EntityQuery<
      /* TEntity */        My.Odata.Entities.Comment,
      /* TDataResult */    Observable<ODataResult<My.Odata.Entities.Comment>>,
      /* TKeyBuilder */    SingleItemsCannotBeQueriedByKey,
      /* TQueryable */     My.Odata.Entities.QueryableComment,
      /* TCaster */        My.Odata.Entities.CommentCaster.Single,
      /* TSingleCaster */  My.Odata.Entities.CommentCaster.Single,
      /* TSubPath */       My.Odata.Entities.CommentSubPath,
      /* TSingleSubPath */ CollectionsCannotBeTraversed,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
  }
  
  export type CommentMoodKeyBuiler = {
    key(key: ThisItemDoesNotHaveAKey, keyType?: WithKeyType): KeySelection<EntityQuery<
      /* TEntity */        My.Odata.Entities.CommentMood,
      /* TDataResult */    Observable<ODataResult<My.Odata.Entities.CommentMood>>,
      /* TKeyBuilder */    SingleItemsCannotBeQueriedByKey,
      /* TQueryable */     My.Odata.Entities.QueryableCommentMood,
      /* TCaster */        My.Odata.Entities.CommentMoodCaster.Single,
      /* TSingleCaster */  My.Odata.Entities.CommentMoodCaster.Single,
      /* TSubPath */       My.Odata.Entities.CommentMoodSubPath,
      /* TSingleSubPath */ My.Odata.Entities.CommentMoodSubPath,
      /* TFetchResult */   Observable<HttpResponse<string>>>>
  }
  
  export type QueryableUserProfileType = { /*TODO*/ }
  
  export module UserProfileTypeCaster { /* TODO */ }
  
  export type QueryableUserType = { /*TODO*/ }
  
  export module UserTypeCaster { /* TODO */ }
  
  export type QueryableMood = { /*TODO*/ }
  
  export module MoodCaster { /* TODO */ }
}

/**
 * A config object which describes relationships between types.
 */
const rootConfig: ODataServiceConfig = {"types":{"My.Odata.Entities":{"AppDetailsBase":{"containerType":"ComplexType","type":{"name":"AppDetailsBase","keyProps":["Id"],"namespace":"My.Odata.Entities","properties":{"Id":{"nullable":false,"navigationProperty":false,"type":{"name":"Int32","namespace":"Edm","isCollection":false}}}}},"AppDetails":{"containerType":"ComplexType","type":{"name":"AppDetails","baseType":{"namespace":"My.Odata.Entities","name":"AppDetailsBase"},"namespace":"My.Odata.Entities","properties":{"AppName":{"nullable":false,"navigationProperty":false,"type":{"name":"String","namespace":"Edm","isCollection":false}},"AppNameWords":{"nullable":true,"navigationProperty":false,"type":{"isCollection":true,"collectionType":{"name":"String","namespace":"Edm","isCollection":false}}}}}},"UserProfile":{"containerType":"ComplexType","type":{"name":"UserProfile","keyProps":["Key"],"namespace":"My.Odata.Entities","properties":{"Key":{"nullable":false,"navigationProperty":false,"type":{"name":"UserProfileType","namespace":"My.Odata.Entities","isCollection":false}},"Description":{"nullable":false,"navigationProperty":false,"type":{"name":"String","namespace":"Edm","isCollection":false}}}}},"UserRole":{"containerType":"ComplexType","type":{"name":"UserRole","keyProps":["Key"],"namespace":"My.Odata.Entities","properties":{"Key":{"nullable":false,"navigationProperty":false,"type":{"name":"UserType","namespace":"My.Odata.Entities","isCollection":false}},"Description":{"nullable":false,"navigationProperty":false,"type":{"name":"String","namespace":"Edm","isCollection":false}}}}},"HasId":{"containerType":"ComplexType","type":{"name":"HasId","keyProps":["Id"],"namespace":"My.Odata.Entities","properties":{"Id":{"nullable":false,"navigationProperty":false,"type":{"name":"String","namespace":"Edm","isCollection":false}}}}},"User":{"containerType":"ComplexType","type":{"name":"User","baseType":{"namespace":"My.Odata.Entities","name":"HasId"},"namespace":"My.Odata.Entities","properties":{"Name":{"nullable":false,"navigationProperty":false,"type":{"name":"String","namespace":"Edm","isCollection":false}},"UserType":{"nullable":false,"navigationProperty":false,"type":{"name":"UserType","namespace":"My.Odata.Entities","isCollection":false}},"Score":{"nullable":false,"navigationProperty":false,"type":{"name":"Double","namespace":"Edm","isCollection":false}},"UserProfileType":{"nullable":false,"navigationProperty":false,"type":{"name":"UserProfileType","namespace":"My.Odata.Entities","isCollection":false}},"Blogs":{"nullable":true,"navigationProperty":true,"type":{"isCollection":true,"collectionType":{"name":"Blog","namespace":"My.Odata.Entities","isCollection":false}}},"BlogPostComments":{"nullable":true,"navigationProperty":true,"type":{"isCollection":true,"collectionType":{"name":"Comment","namespace":"My.Odata.Entities","isCollection":false}}}}}},"Blog":{"containerType":"ComplexType","type":{"name":"Blog","baseType":{"namespace":"My.Odata.Entities","name":"HasId"},"namespace":"My.Odata.Entities","properties":{"Name":{"nullable":false,"navigationProperty":false,"type":{"name":"String","namespace":"Edm","isCollection":false}},"UserId":{"nullable":true,"navigationProperty":false,"type":{"name":"String","namespace":"Edm","isCollection":false}},"BlogPostNames":{"nullable":true,"navigationProperty":false,"type":{"isCollection":true,"collectionType":{"name":"String","namespace":"Edm","isCollection":false}}},"User":{"nullable":true,"navigationProperty":true,"type":{"name":"User","namespace":"My.Odata.Entities","isCollection":false}},"Posts":{"nullable":true,"navigationProperty":true,"type":{"isCollection":true,"collectionType":{"name":"BlogPost","namespace":"My.Odata.Entities","isCollection":false}}}}}},"BlogPost":{"containerType":"ComplexType","type":{"name":"BlogPost","baseType":{"namespace":"My.Odata.Entities","name":"HasId"},"namespace":"My.Odata.Entities","properties":{"Name":{"nullable":false,"navigationProperty":false,"type":{"name":"String","namespace":"Edm","isCollection":false}},"Content":{"nullable":false,"navigationProperty":false,"type":{"name":"String","namespace":"Edm","isCollection":false}},"Likes":{"nullable":false,"navigationProperty":false,"type":{"name":"Int64","namespace":"Edm","isCollection":false}},"AgeRestriction":{"nullable":true,"navigationProperty":false,"type":{"name":"Int64","namespace":"Edm","isCollection":false}},"Date":{"nullable":false,"navigationProperty":false,"type":{"name":"DateTimeOffset","namespace":"Edm","isCollection":false}},"BlogId":{"nullable":true,"navigationProperty":false,"type":{"name":"String","namespace":"Edm","isCollection":false}},"Words":{"nullable":true,"navigationProperty":false,"type":{"isCollection":true,"collectionType":{"name":"String","namespace":"Edm","isCollection":false}}},"Blog":{"nullable":true,"navigationProperty":true,"type":{"name":"Blog","namespace":"My.Odata.Entities","isCollection":false}},"Comments":{"nullable":true,"navigationProperty":true,"type":{"isCollection":true,"collectionType":{"name":"Comment","namespace":"My.Odata.Entities","isCollection":false}}}}}},"Comment":{"containerType":"ComplexType","type":{"name":"Comment","baseType":{"namespace":"My.Odata.Entities","name":"HasId"},"namespace":"My.Odata.Entities","properties":{"Title":{"nullable":false,"navigationProperty":false,"type":{"name":"String","namespace":"Edm","isCollection":false}},"Text":{"nullable":false,"navigationProperty":false,"type":{"name":"String","namespace":"Edm","isCollection":false}},"BlogPostId":{"nullable":true,"navigationProperty":false,"type":{"name":"String","namespace":"Edm","isCollection":false}},"UserId":{"nullable":true,"navigationProperty":false,"type":{"name":"String","namespace":"Edm","isCollection":false}},"Words":{"nullable":true,"navigationProperty":false,"type":{"isCollection":true,"collectionType":{"name":"String","namespace":"Edm","isCollection":false}}},"Tags":{"nullable":true,"navigationProperty":false,"type":{"isCollection":true,"collectionType":{"name":"CommentTag","namespace":"My.Odata.Entities","isCollection":false}}},"Mood":{"nullable":true,"navigationProperty":false,"type":{"name":"CommentMood","namespace":"My.Odata.Entities","isCollection":false}},"BlogPost":{"nullable":true,"navigationProperty":true,"type":{"name":"BlogPost","namespace":"My.Odata.Entities","isCollection":false}},"User":{"nullable":true,"navigationProperty":true,"type":{"name":"User","namespace":"My.Odata.Entities","isCollection":false}}}}},"CompositeKeyItem":{"containerType":"ComplexType","type":{"name":"CompositeKeyItem","keyProps":["Id1","Id2"],"namespace":"My.Odata.Entities","properties":{"Id1":{"nullable":false,"navigationProperty":false,"type":{"name":"String","namespace":"Edm","isCollection":false}},"Id2":{"nullable":false,"navigationProperty":false,"type":{"name":"Guid","namespace":"Edm","isCollection":false}},"Data":{"nullable":true,"navigationProperty":false,"type":{"name":"String","namespace":"Edm","isCollection":false}}}}},"CommentTag":{"containerType":"ComplexType","type":{"name":"CommentTag","namespace":"My.Odata.Entities","properties":{"Tag":{"nullable":true,"navigationProperty":false,"type":{"name":"String","namespace":"Edm","isCollection":false}},"Comments":{"nullable":true,"navigationProperty":true,"type":{"isCollection":true,"collectionType":{"name":"Comment","namespace":"My.Odata.Entities","isCollection":false}}}}}},"CommentMood":{"containerType":"ComplexType","type":{"name":"CommentMood","namespace":"My.Odata.Entities","properties":{"Key":{"nullable":true,"navigationProperty":false,"type":{"name":"String","namespace":"Edm","isCollection":false}},"Mood":{"nullable":false,"navigationProperty":false,"type":{"name":"Mood","namespace":"My.Odata.Entities","isCollection":false}},"CommentId":{"nullable":true,"navigationProperty":false,"type":{"name":"String","namespace":"Edm","isCollection":false}},"Comment":{"nullable":true,"navigationProperty":true,"type":{"name":"Comment","namespace":"My.Odata.Entities","isCollection":false}}}}},"UserProfileType":{"containerType":"Enum","type":{"namespace":"My.Odata.Entities","name":"UserProfileType","members":{"Standard":10,"Advanced":11}}},"UserType":{"containerType":"Enum","type":{"namespace":"My.Odata.Entities","name":"UserType","members":{"User":0,"Admin":1}}},"Mood":{"containerType":"Enum","type":{"namespace":"My.Odata.Entities","name":"Mood","members":{"Happy":1,"Sad":2}}}}},"entitySets":{"My/Odata.Container":{"UserProfiles":{"isSingleton":false,"namespace":"My/Odata.Container","name":"UserProfiles","forType":{"isCollection":false,"namespace":"My.Odata.Entities","name":"UserProfile"}},"UserRoles":{"isSingleton":false,"namespace":"My/Odata.Container","name":"UserRoles","forType":{"isCollection":false,"namespace":"My.Odata.Entities","name":"UserRole"}},"HasIds":{"isSingleton":false,"namespace":"My/Odata.Container","name":"HasIds","forType":{"isCollection":false,"namespace":"My.Odata.Entities","name":"HasId"}},"Users":{"isSingleton":false,"namespace":"My/Odata.Container","name":"Users","forType":{"isCollection":false,"namespace":"My.Odata.Entities","name":"User"}},"Blogs":{"isSingleton":false,"namespace":"My/Odata.Container","name":"Blogs","forType":{"isCollection":false,"namespace":"My.Odata.Entities","name":"Blog"}},"BlogPosts":{"isSingleton":false,"namespace":"My/Odata.Container","name":"BlogPosts","forType":{"isCollection":false,"namespace":"My.Odata.Entities","name":"BlogPost"}},"BlogPosts2":{"isSingleton":false,"namespace":"My/Odata.Container","name":"BlogPosts2","forType":{"isCollection":false,"namespace":"My.Odata.Entities","name":"BlogPost"}},"Comments":{"isSingleton":false,"namespace":"My/Odata.Container","name":"Comments","forType":{"isCollection":false,"namespace":"My.Odata.Entities","name":"Comment"}},"CompositeKeyItems":{"isSingleton":false,"namespace":"My/Odata.Container","name":"CompositeKeyItems","forType":{"isCollection":false,"namespace":"My.Odata.Entities","name":"CompositeKeyItem"}},"AppDetails":{"isSingleton":true,"namespace":"My/Odata.Container","name":"AppDetails","forType":{"isCollection":false,"namespace":"My.Odata.Entities","name":"AppDetails"}},"AppDetailsBase":{"isSingleton":true,"namespace":"My/Odata.Container","name":"AppDetailsBase","forType":{"isCollection":false,"namespace":"My.Odata.Entities","name":"AppDetailsBase"}}}}}



/**
 * Type references for described Edm data types.
 */
export module Edm {
  export type String = string;
  export type Guid = string;
  export type Boolean = boolean;
  export type DateTime = Date;
  export type DateTimeOffset = Date;
  export type Int16 = number;
  export type Int32 = number;
  export type Int64 = number;
  export type Decimal = number;
  export type Double = number;
  export type Single = number;
}
