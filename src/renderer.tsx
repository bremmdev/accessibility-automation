import { jsxRenderer } from 'hono/jsx-renderer';

export const renderer = jsxRenderer(({ children }) => {
	return (
		<html lang="en">
			<head>
				<link href="output.css" rel="stylesheet" />
				<script src="main.js" type="module"></script>
				<script src="htmx.min.js" type="text/javascript"></script>
				<script src="htmx-sse.js" type="text/javascript"></script>
				<script src="https://unpkg.com/htmx.org@1.9.12/dist/ext/json-enc.js"></script>
			</head>
			<body>
				<main className="max-w-7xl w-11/12 mx-auto">{children}</main>
			</body>
		</html>
	);
});
