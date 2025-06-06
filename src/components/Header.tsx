import { baseStrokeClass } from '../classes';

export default function Header() {
	return (
		<header class="bg-gradient-to-b from-primary/30 to-primary/5 px-8 py-20">
			<div class="flex flex-col lg:flex-row justify-center lg:justify-between items-center gap-12 max-w-7xl w-11/12 mx-auto">
				<div class="space-y-8 text-center lg:text-left">
					<h1 class={`relative text-4xl lg:text-5xl font-bold w-fit max-lg:mx-auto ${baseStrokeClass}`}>AccessiCheck</h1>
					<p class="text-lg lg:text-xl text-balance">
						<span class={`relative font-semibold text-primary-text ${baseStrokeClass}`}>Instantly</span> test your website's accessibility,
						identify web accessibility issues and get actionable insights to improve your website's accessibility.
					</p>
				</div>
				<img src="/hero.webp" class="max-h-36 lg:max-h-48" />
			</div>
		</header>
	);
}
