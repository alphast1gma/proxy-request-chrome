# Custom Request Plugin for Chrome

## Overview

This Chrome plugin is a versatile tool for web developers, security researchers, and curious internet users. It provides functionalities for domain validation, web crawling, custom HTTP requests, and subdomain discovery. With a sleek and user-friendly interface, this plugin makes it easy to explore and interact with web domains.

## Features

1. **Domain Validation**: Quickly check if a domain or IP address is valid and accessible.
2. **Dynamic Field Crawler**: Discover dynamic fields (like form inputs and URL parameters) on a given website.
3. **Custom Request Sender**: Send multiple custom HTTP requests with different payloads to a specified domain and path.
4. **Last Response Viewer**: View the last HTTP response received from your requests.
5. **Subdomain Discovery**: Use Google search to find subdomains for a given domain.

## Installation

1. Clone this repository or download the source code.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" using the toggle switch in the top right corner.
4. Click on "Load unpacked" and select the directory containing the plugin files.
5. The plugin should now appear in your Chrome toolbar.

## Usage

### Domain Input
- Enter the target domain or IP address in the "Domain or IP (required)" field.
- The plugin will automatically validate the input as you type.

### Path Input (Optional)
- If you want to target a specific path on the domain, enter it in the "Path (optional)" field.

### Payloads (Optional)
- Enter payloads in the textarea, one per line.
- These payloads will be used for custom requests.

### Load Payloads
- Click "Load Payloads" to upload a text file containing payloads (one per line).

### Crawl Fields
- Click "Crawl Fields" to discover dynamic fields on the specified domain.
- Results will show field names and example usage.

### Send Requests
- Click "Send Requests" to send HTTP requests using the specified domain, path (if any), and payloads.
- Results will be displayed in the plugin and saved to a file named `output.txt` in your default download folder.

### Last Response
- Click "Last Response" to view the most recent HTTP response received.

### Domain Search
- Click "Domain Search" to discover subdomains of the specified domain using Google search.

## Output

All results are displayed in a clean, formatted manner within the plugin interface. Additionally, for the "Send Requests" function, a detailed output is saved to `output.txt` in your default Chrome download folder.

## Notes

- The plugin uses HTTPS by default but will fall back to HTTP if necessary.
- Subdomain discovery relies on Google search results and may not be comprehensive.
- Be respectful of websites' terms of service and robots.txt files when using this plugin.

## Troubleshooting

- If the plugin doesn't work as expected, try reloading it from the `chrome://extensions/` page.
- Check the Chrome console for any error messages.
- Ensure you have a stable internet connection.

## Contributing

Contributions to improve the plugin are welcome. Please feel free to submit pull requests or create issues for bugs and feature requests.

## License

[Specify your license here, e.g., MIT, GPL, etc.]

## Disclaimer

This tool is for educational and research purposes only. The user is responsible for complying with all applicable laws and regulations when using this plugin.
