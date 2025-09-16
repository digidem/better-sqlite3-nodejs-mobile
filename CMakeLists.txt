cmake_minimum_required(VERSION 3.25)

find_package(cmake-bare REQUIRED PATHS node_modules/cmake-bare)
find_package(cmake-napi REQUIRED PATHS node_modules/cmake-napi)

message("cmake-bare: ${cmake-bare_DIR}")

set(CMAKE_POSITION_INDEPENDENT_CODE ON)
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

project(better_sqlite3 C CXX)

bare_target(target)

# SQLite3 static library
add_library(sqlite3 STATIC)

target_sources(
  sqlite3
  PRIVATE
    deps/sqlite3/sqlite3.c
)

target_include_directories(
  sqlite3
  PUBLIC
    deps/sqlite3
)

target_compile_options(
  sqlite3
  PRIVATE
    -std=c99
    -w  # Suppress warnings for SQLite
)

# SQLite compile-time definitions from defines.gypi
target_compile_definitions(
  sqlite3
  PUBLIC
    HAVE_INT16_T=1
    HAVE_INT32_T=1
    HAVE_INT8_T=1
    HAVE_STDINT_H=1
    HAVE_UINT16_T=1
    HAVE_UINT32_T=1
    HAVE_UINT8_T=1
    HAVE_USLEEP=1
    SQLITE_DEFAULT_CACHE_SIZE=-16000
    SQLITE_DEFAULT_FOREIGN_KEYS=1
    SQLITE_DEFAULT_MEMSTATUS=0
    SQLITE_DEFAULT_WAL_SYNCHRONOUS=1
    SQLITE_DQS=0
    SQLITE_ENABLE_COLUMN_METADATA
    SQLITE_ENABLE_DBSTAT_VTAB
    SQLITE_ENABLE_DESERIALIZE
    SQLITE_ENABLE_FTS3
    SQLITE_ENABLE_FTS3_PARENTHESIS
    SQLITE_ENABLE_FTS4
    SQLITE_ENABLE_FTS5
    SQLITE_ENABLE_GEOPOLY
    SQLITE_ENABLE_JSON1
    SQLITE_ENABLE_MATH_FUNCTIONS
    SQLITE_ENABLE_RTREE
    SQLITE_ENABLE_STAT4
    SQLITE_ENABLE_UPDATE_DELETE_LIMIT
    SQLITE_LIKE_DOESNT_MATCH_BLOBS
    SQLITE_OMIT_DEPRECATED
    SQLITE_OMIT_PROGRESS_CALLBACK
    SQLITE_OMIT_SHARED_CACHE
    SQLITE_OMIT_TCL_VARIABLE
    SQLITE_SOUNDEX
    SQLITE_THREADSAFE=2
    SQLITE_TRACE_SIZE_LIMIT=32
    SQLITE_USE_URI=0
)

# Platform-specific definitions
if(target MATCHES "win32")
  target_compile_definitions(
    sqlite3
    PUBLIC
      WIN32
  )
endif()

# Debug vs Release configurations
if(CMAKE_BUILD_TYPE STREQUAL "Debug")
  target_compile_definitions(
    sqlite3
    PUBLIC
      DEBUG
      _DEBUG
      SQLITE_DEBUG
      SQLITE_MEMDEBUG
      SQLITE_ENABLE_API_ARMOR
      SQLITE_WIN32_MALLOC_VALIDATE
  )

  target_compile_options(
    sqlite3
    PRIVATE
      -O0
  )
else()
  target_compile_definitions(
    sqlite3
    PUBLIC
      NDEBUG
  )

  target_compile_options(
    sqlite3
    PRIVATE
      -O3
  )
endif()

# Better SQLite3 Node.js addon
add_napi_module(better_sqlite3_node)

target_sources(
  ${better_sqlite3_node}
  PRIVATE
    src/better_sqlite3.cpp
)

target_link_libraries(
  ${better_sqlite3_node}
  PRIVATE
    sqlite3
)

target_compile_options(
  ${better_sqlite3_node}
  PRIVATE
    -std=c++20
)

# Fix Android NDK C++ standard library include path
if(ANDROID)
  target_include_directories(
    ${better_sqlite3_node}
    SYSTEM PRIVATE
      "${CMAKE_SYSROOT}/usr/include/c++/v1"
  )
endif()

# Platform-specific linker flags
if(target MATCHES "linux")
  target_link_options(
    ${better_sqlite3_node}
    PRIVATE
      -Wl,-Bsymbolic
      -Wl,--exclude-libs,ALL
  )
endif()

# Test extension (optional)
add_library(test_extension SHARED)

target_sources(
  test_extension
  PRIVATE
    deps/test_extension.c
)

target_link_libraries(
  test_extension
  PRIVATE
    sqlite3
)