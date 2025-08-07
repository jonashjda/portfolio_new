function parseMarkdownFile(content) {
    // Match front matter between --- delimiters
    const matches = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    
    if (!matches) {
        return { frontMatter: {}, content: content };
    }

    const [, frontMatterRaw, contentRaw] = matches;
    const frontMatter = {};

    // Process front matter line by line
    const lines = frontMatterRaw.split(/\r?\n/);
    let currentKey = null;

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        if (trimmedLine.includes(':')) {
            // This is a key-value pair
            const [key, ...valueParts] = trimmedLine.split(':');
            currentKey = key.trim();
            let value = valueParts.join(':').trim();

            // Handle quoted strings
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }

            if (!value) {
                frontMatter[currentKey] = []; // Prepare for list
            } else {
                frontMatter[currentKey] = value;
            }
        } else if (trimmedLine.startsWith('-')) {
            // Handle any list type (including tags)
            if (!Array.isArray(frontMatter[currentKey])) {
                frontMatter[currentKey] = [];
            }
            const item = trimmedLine.slice(1).trim();
            frontMatter[currentKey].push(item);
        }
    }

    // Return the parsed front matter and the actual content
    return {
        frontMatter,
        content: contentRaw.trim()
    };
}

module.exports = { parseMarkdownFile };
