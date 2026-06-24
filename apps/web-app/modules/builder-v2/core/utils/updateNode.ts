import type { BuilderNode } from "../../types/blueprint";

export function updateNode(
    node: BuilderNode,
    patch: Partial<BuilderNode>
): BuilderNode {

    return {

        ...node,

        ...patch,

        props: {

            ...node.props,

            ...(patch.props ?? {}),

        },

        style: {

            ...node.style,

            ...(patch.style ?? {}),

        },

    };

}