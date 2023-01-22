
pushd .\odata-ts-client
echo "Building query"
tsc
if (-not($?)) {
    popd
    exit 1
}

popd
pushd .\odata-ts-client-code-gen
echo "Building query compile time"
tsc
if (-not($?)) {
    popd
    exit 1
}

popd