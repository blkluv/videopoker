import Document, { Html, Head, Main, NextScript } from "next/document";

function min(text: string) {
	return text.replace(/[\t\r\n]/g, "");
}

export default class MyDocument extends Document {

	render() {
		return <Html lang="en">
			<Head>
				<meta charSet="UTF-8"/>
				<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
				<meta name="robots" content="follow, index" />
				<meta name="theme-color" content="#fff" />
				<link rel="icon" type="image/png" href="/logo192.png" />
				<link rel="apple-touch-icon" href="/logo192.png" />
				<title>Videopoker</title>
				<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap" rel="stylesheet" />
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	}

}
