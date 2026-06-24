export default function ImageContent({

    node,

}:Props){

    return (

        <>

            <MediaProperty
                node={node}
                property="src"
                label="Image"
            />

            <TextProperty
                node={node}
                property="alt"
                label="Alt Text"
            />

            <TextProperty
                node={node}
                property="title"
                label="Title"
            />

            <SelectProperty
                node={node}
                property="objectFit"
                label="Object Fit"
                options={[
                    "cover",
                    "contain",
                    "fill",
                    "none"
                ]}
            />

            <SliderProperty
                node={node}
                property="borderRadius"
                label="Border Radius"
                min={0}
                max={100}
            />

            <SwitchProperty
                node={node}
                property="lazy"
                label="Lazy Loading"
            />

        </>

    );

}