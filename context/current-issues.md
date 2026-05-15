when i click on create it is showing Internal server error

and this error

## Error Type
Console Error

## Error Message
@prisma/client did not initialize yet. Please run "prisma generate" and try to import it again.


    at module evaluation (lib\prisma.ts:7:33)
    at <anonymous> (about://React/Server/C:%5CUsers%5CANUSHKA%20SINGH%5CDesktop%5Csummer_project%5Cghost-ai%5C.next%5Cdev%5Cserver%5Cchunks%5Cssr%5Clib_prisma_ts_0imjq09._.js?2:8:16)
    at getProjectsForUser (lib\project-helpers.ts:20:24)
    at EditorPage (app\editor\page.tsx:9:22)
    at resolveErrorDev (file://C:/Users/ANUSHKA SINGH/Desktop/summer_project/ghost-ai/.next/dev/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_0p3wegg._.js:1919:105)
    at getOutlinedModel (file://C:/Users/ANUSHKA SINGH/Desktop/summer_project/ghost-ai/.next/dev/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_0p3wegg._.js:1469:28)
    at parseModelString (file://C:/Users/ANUSHKA SINGH/Desktop/summer_project/ghost-ai/.next/dev/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_0p3wegg._.js:1584:50)
    at reviveModel (file://C:/Users/ANUSHKA SINGH/Desktop/summer_project/ghost-ai/.next/dev/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_0p3wegg._.js:2522:66)
    at parseModel (file://C:/Users/ANUSHKA SINGH/Desktop/summer_project/ghost-ai/.next/dev/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_0p3wegg._.js:2517:16)
    at initializeModelChunk (file://C:/Users/ANUSHKA SINGH/Desktop/summer_project/ghost-ai/.next/dev/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_0p3wegg._.js:1084:25)
    at getOutlinedModel (file://C:/Users/ANUSHKA SINGH/Desktop/summer_project/ghost-ai/.next/dev/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_0p3wegg._.js:1407:17)
    at parseModelString (file://C:/Users/ANUSHKA SINGH/Desktop/summer_project/ghost-ai/.next/dev/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_0p3wegg._.js:1639:50)
    at reviveModel (file://C:/Users/ANUSHKA SINGH/Desktop/summer_project/ghost-ai/.next/dev/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_0p3wegg._.js:2522:66)
    at reviveModel (file://C:/Users/ANUSHKA SINGH/Desktop/summer_project/ghost-ai/.next/dev/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_0p3wegg._.js:2525:61)
    at parseModel (file://C:/Users/ANUSHKA SINGH/Desktop/summer_project/ghost-ai/.next/dev/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_0p3wegg._.js:2517:16)
    at initializeModelChunk (file://C:/Users/ANUSHKA SINGH/Desktop/summer_project/ghost-ai/.next/dev/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_0p3wegg._.js:1084:25)
    at resolveConsoleEntry (file://C:/Users/ANUSHKA SINGH/Desktop/summer_project/ghost-ai/.next/dev/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_0p3wegg._.js:2047:96)
    at processFullStringRow (file://C:/Users/ANUSHKA SINGH/Desktop/summer_project/ghost-ai/.next/dev/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_0p3wegg._.js:2453:17)
    at processFullBinaryRow (file://C:/Users/ANUSHKA SINGH/Desktop/summer_project/ghost-ai/.next/dev/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_0p3wegg._.js:2393:9)
    at processBinaryChunk (file://C:/Users/ANUSHKA SINGH/Desktop/summer_project/ghost-ai/.next/dev/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_0p3wegg._.js:2502:221)
    at progress (file://C:/Users/ANUSHKA SINGH/Desktop/summer_project/ghost-ai/.next/dev/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_0p3wegg._.js:2676:20)
    at EditorPage (<anonymous>:null:null)

## Code Frame
   5 | }
   6 |
>  7 | const prisma = global.prisma || new PrismaClient();
     |                                 ^
   8 |
   9 | if (process.env.NODE_ENV !== 'production') {
  10 |   global.prisma = prisma;

Next.js version: 16.2.6 (Turbopack)


when i do prisma generate this is the error it is throwing 


prisma : The term 'prisma' is not recognized as the name of 
a cmdlet, function, script file, or operable program. Check 
the spelling of the name, or if a path was included, verify 
that the path is correct and try again.
At line:1 char:1
+ prisma generate
+ ~~~~~~
    + CategoryInfo          : ObjectNotFound: (prisma:Strin 
   g) [], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException
 