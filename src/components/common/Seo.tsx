import { useEffect } from "react";

interface SeoProps {
    title?: string;
    description?: string;
    robots?: string;
}

export function Seo({
    title,
    description,
    robots = "index, follow",
}: SeoProps) {
    useEffect(() => {
        const previousTitle = document.title;

        const getOrCreateMeta = (name: string) => {
            let meta = document.querySelector<HTMLMetaElement>(
                `meta[name="${name}"]`,
            );

            if (!meta) {
                meta = document.createElement("meta");
                meta.name = name;
                document.head.appendChild(meta);
            }

            return meta;
        };

        const robotsMeta = getOrCreateMeta("robots");
        const descriptionMeta = getOrCreateMeta("description");

        const previousRobots = robotsMeta.content;
        const previousDescription = descriptionMeta.content;

        if (title) {
            document.title = title;
        }

        robotsMeta.content = robots;

        if (description) {
            descriptionMeta.content = description;
        }

        return () => {
            document.title = previousTitle;

            robotsMeta.content = previousRobots;
            descriptionMeta.content = previousDescription;
        };
    }, [title, description, robots]);

    return null;
}