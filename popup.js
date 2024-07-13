document.addEventListener('DOMContentLoaded', function() {
    const urlInput = document.getElementById('url');
    const pathInput = document.getElementById('path');
    const payloadsTextarea = document.getElementById('payloads');
    const loadPayloadsButton = document.getElementById('loadPayloads');
    const crawlButton = document.getElementById('crawl');
    const sendRequestButton = document.getElementById('sendRequest');
    const lastResponseButton = document.getElementById('lastResponseButton');
    const googleSearchButton = document.getElementById('googleSearchButton');
    const responseElement = document.getElementById('response');
    const domainValidationElement = document.getElementById('domainValidation');

    urlInput.addEventListener('input', debounce(validateInput, 500));

    loadPayloadsButton.addEventListener('click', function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt';
        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = event => {
                payloadsTextarea.value = event.target.result;
            };
            reader.readAsText(file);
        };
        input.click();
    });

    crawlButton.addEventListener('click', function() {
        const input = urlInput.value.trim();
        if (!input) {
            alert('Please enter a domain or IP address.');
            return;
        }
        chrome.runtime.sendMessage({
            action: 'crawl',
            domain: input
        }, response => {
            if (response.error) {
                renderResponse('Error: ' + response.error, 'error');
            } else {
                const result = 'Dynamic fields found:\n\n' + 
                    response.dynamicFields.map(field => `Field: ${field.name}\nExample: ${field.example}`).join('\n\n');
                renderResponse(result, 'text');
            }
        });
    });

    sendRequestButton.addEventListener('click', function() {
        const input = urlInput.value.trim();
        const path = pathInput.value.trim();
        const payloads = payloadsTextarea.value.split('\n').filter(p => p.trim());

        if (!input) {
            alert('Please enter a domain or IP address.');
            return;
        }

        chrome.runtime.sendMessage({
            action: 'sendRequests',
            domain: input,
            path: path,
            payloads: payloads
        }, response => {
            if (response.error) {
                renderResponse('Error: ' + response.error, 'error');
            } else {
                renderResponse('Requests sent. Results:\n\n' + response.results.join('\n\n'), 'text');
            }
        });
    });

    lastResponseButton.addEventListener('click', function() {
        chrome.runtime.sendMessage({ action: 'getLastResponse' }, response => {
            if (response.error) {
                renderResponse('Error: ' + response.error, 'error');
            } else if (response.lastResponse) {
                renderResponse('Last Response:\n\n' + response.lastResponse, 'text');
            } else {
                renderResponse('No response available yet.', 'text');
            }
        });
    });

    googleSearchButton.addEventListener('click', function() {
        const domain = urlInput.value.trim();
        if (!domain) {
            alert('Please enter a domain.');
            return;
        }

        chrome.runtime.sendMessage({
            action: 'googleDomainSearch',
            domain: domain
        }, response => {
            if (response.error) {
                renderResponse('Error: ' + response.error, 'error');
            } else {
                const subdomains = response.subdomains;
                if (subdomains.length === 0) {
                    renderResponse('No subdomains found.', 'text');
                } else {
                    const result = 'Subdomains found:\n\n' + subdomains.join('\n');
                    renderResponse(result, 'text');
                }
            }
        });
    });

    function validateInput() {
        const input = urlInput.value.trim();
        if (!input) {
            domainValidationElement.textContent = '';
            return;
        }

        domainValidationElement.textContent = 'Validating...';
        chrome.runtime.sendMessage({
            action: 'validateDomain',
            domain: input
        }, response => {
            if (response.valid) {
                domainValidationElement.textContent = 'Input is valid';
                domainValidationElement.style.color = 'green';
            } else {
                domainValidationElement.textContent = 'Input is invalid';
                domainValidationElement.style.color = 'red';
            }
        });
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function renderResponse(data, type) {
        responseElement.innerHTML = ''; // Clear previous content

        const preElement = document.createElement('pre');
        preElement.style.whiteSpace = 'pre-wrap';
        preElement.style.wordBreak = 'break-word';
        preElement.style.maxHeight = '300px';
        preElement.style.overflowY = 'auto';
        preElement.style.padding = '10px';
        preElement.style.border = '1px solid #ddd';
        preElement.style.borderRadius = '4px';
        preElement.style.backgroundColor = '#f8f8f8';

        switch (type) {
            case 'json':
                try {
                    const jsonData = JSON.parse(data);
                    preElement.textContent = JSON.stringify(jsonData, null, 2);
                } catch (e) {
                    preElement.textContent = data;
                }
                break;
            case 'html':
                const iframe = document.createElement('iframe');
                iframe.srcdoc = data;
                iframe.style.width = '100%';
                iframe.style.height = '300px';
                iframe.style.border = 'none';
                responseElement.appendChild(iframe);
                return;
            case 'text':
                preElement.textContent = data;
                break;
            case 'error':
                preElement.style.color = 'red';
                preElement.textContent = data;
                break;
        }

        responseElement.appendChild(preElement);
    }
});