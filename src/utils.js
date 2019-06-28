
function parseAsset(asset) {
    const parse = asset.split(" ")
    const value = parse[0]
    const token = parse[1]
    return parseFloat(value)
}

export default {
    parseAsset
}