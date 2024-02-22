function audio(src: string) {
	let instance: HTMLAudioElement;
	return () => {
		if(!instance) {
			instance = new Audio(`/audio/${src}.mp3`);
		}
		instance.volume = 1;
		instance.currentTime = 0;
		instance.play();
	};
}

export const card = audio("card");

export const error = audio("error");

export const draw = audio("draw");

export const loss = audio("loss");

export const win = audio("win");
