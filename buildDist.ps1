
pushd .\odata-query
echo "Building query"
tsc
if (-not($?)) {
    popd
    exit 1
}

popd
pushd .\odata-query-compile-time
echo "Building query compile time"
tsc
if (-not($?)) {
    popd
    exit 1
}

popd