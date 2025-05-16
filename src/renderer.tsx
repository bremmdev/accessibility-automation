import { jsxRenderer } from 'hono/jsx-renderer';

export const renderer = jsxRenderer(({ children }) => {
	return (
		<html lang="en">
			<head>
				<link href="output.css" rel="stylesheet" />
				<script src="main.js" type="module"></script>
			</head>
			<body>{children}</body>
		</html>
	);
});
