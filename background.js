let lastResponse = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'validateDomain') {
        validateDomain(request.domain)
            .then(valid => sendResponse({ valid }))
            .catch(error => sendResponse({ valid: false, error: error.toString() }));
        return true;  // Will respond asynchronously
    } else if (request.action === 'crawl') {
        crawlDomain(request.domain)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ error: error.toString() }));
        return true;  // Will respond asynchronously
    } else if (request.action === 'sendRequests') {
        sendRequests(request.domain, request.path, request.payloads)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ error: error.toString() }));
        return true;  // Will respond asynchronously
    } else if (request.action === 'getLastResponse') {
        sendResponse({ lastResponse: lastResponse });
    } else if (request.action === 'googleDomainSearch') {
        googleDomainSearch(request.domain)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ error: error.toString() }));
        return true;  // Will respond asynchronously
    }
});

async function validateDomain(input) {
    // Remove any trailing slashes
    input = input.replace(/\/$/, '');

    // If the input doesn't start with a protocol, add https://
    if (!/^https?:\/\//i.test(input)) {
        input = 'https://' + input;
    }

    try {
        const url = new URL(input);
        const response = await fetch(url.href, { method: 'GET' });
        return true; // If we get here, the fetch was successful
    } catch (error) {
        console.error('Validation error:', error);
        return false;
    }
}

async function crawlDomain(input) {
    // Remove any trailing slashes
    input = input.replace(/\/$/, '');

    // If the input doesn't start with a protocol, add http:// (we'll try HTTPS later if HTTP fails)
    if (!/^https?:\/\//i.test(input)) {
        input = 'http://' + input;
    }

    try {
        const url = new URL(input);
        let response;
        let html;

        // Try HTTPS first, then fallback to HTTP if HTTPS fails
        try {
            response = await fetch(url.href.replace('http://', 'https://'), { method: 'GET' });
            html = await response.text();
        } catch (error) {
            console.log('HTTPS failed, trying HTTP');
            response = await fetch(url.href, { method: 'GET' });
            html = await response.text();
        }

        const dynamicFields = [];

        // Use regex to find form inputs
        const inputRegex = /<input[^>]*name=["']([^"']+)["'][^>]*>/g;
        let match;
        while ((match = inputRegex.exec(html)) !== null) {
            const name = match[1];
            const example = `${url.origin}?${name}=example_value`;
            dynamicFields.push({ name, example });
        }

        // Use regex to find URL parameters in links
        const hrefRegex = /href=["']([^"']+\?[^"']+)["']/g;
        while ((match = hrefRegex.exec(html)) !== null) {
            const href = match[1];
            const [path, query] = href.split('?');
            const params = new URLSearchParams(query);
            for (let [key, value] of params) {
                const example = `${url.origin}${path}?${key}=example_value`;
                if (!dynamicFields.some(field => field.name === key)) {
                    dynamicFields.push({ name: key, example });
                }
            }
        }

        // Sort dynamicFields by name for consistency
        dynamicFields.sort((a, b) => a.name.localeCompare(b.name));

        return { dynamicFields };
    } catch (error) {
        throw new Error('Failed to crawl domain: ' + error.toString());
    }
}

async function sendRequests(input, path, payloads) {
    // Remove any trailing slashes
    input = input.replace(/\/$/, '');

    // If the input doesn't start with a protocol, add https://
    if (!/^https?:\/\//i.test(input)) {
        input = 'https://' + input;
    }

    const url = new URL(input);
    if (path) {
        url.pathname = path;
    }

    const results = [];

    for (const payload of payloads) {
        try {
            const fullUrl = new URL(url.href);
            fullUrl.search = payload;
            const response = await fetch(fullUrl.href);
            const responseText = await response.text();
            lastResponse = responseText;  // Store the last response
            results.push(`Payload: ${payload}\nStatus: ${response.status}\nSize: ${response.headers.get('content-length') || 'unknown'} bytes`);
        } catch (error) {
            results.push(`Payload: ${payload}\nError: ${error.toString()}`);
        }
    }
    
    await saveToFile(results.join('\n\n'));
    return { results };  // Return results to be displayed in the popup
}

function saveToFile(content) {
    return new Promise((resolve, reject) => {
        const blob = new Blob([content], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        chrome.downloads.download({
            url: url,
            filename: 'output.txt',
            saveAs: false  // This will save the file to the default download folder without prompting
        }, downloadId => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(downloadId);
            }
            // Clean up the blob URL
            URL.revokeObjectURL(url);
        });
    });
}

async function googleDomainSearch(domain) {
    const query = `site:${domain} -site:www.${domain}`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        const html = await response.text();

        // Extract subdomains from the search results
        const subdomainRegex = new RegExp(`([a-zA-Z0-9-]+\\.)+${domain.replace('.', '\\.')}`, 'g');
        const matches = html.match(subdomainRegex) || [];

        // Remove duplicates and the main domain
        const subdomains = [...new Set(matches)]
            .filter(subdomain => subdomain !== domain && !subdomain.startsWith('www.'))
            .sort();

        return { subdomains };
    } catch (error) {
        throw new Error('Failed to perform Google domain search: ' + error.toString());
    }
}