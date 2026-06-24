export function createNodeId(
    type: string
){

    return `${type}_${crypto.randomUUID()}`;

}