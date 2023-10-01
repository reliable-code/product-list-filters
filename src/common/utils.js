const getUniqueTimestampSlice =
    () => Date.now().toString().slice(1, 9);

exports.getUniqueTimestampSlice = getUniqueTimestampSlice;
