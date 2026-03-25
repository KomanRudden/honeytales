// CloudFront Function — URL rewriter for clean URLs (no .html)
// Attach to your CloudFront distribution: Viewer Request event
//
// Effect:
//   /about          → /about.html
//   /books/goggas   → /books/goggas.html
//   /               → /index.html  (unchanged, S3 default)
//   /assets/bee.png → /assets/bee.png  (unchanged, has extension)

function handler(event) {
    var request = event.request;
    var uri = request.uri;

    // Already has a file extension — leave it alone
    if (uri.match(/\.[a-zA-Z0-9]+$/)) {
        return request;
    }

    // Root — S3 handles this via default root object setting
    if (uri === '/') {
        return request;
    }

    // Trailing slash → directory index
    if (uri.endsWith('/')) {
        request.uri = uri + 'index.html';
        return request;
    }

    // Everything else — append .html
    request.uri = uri + '.html';
    return request;
}
