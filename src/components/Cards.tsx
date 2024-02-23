import { card as cardClick } from "../utils/audio";
import { parse } from "../utils/cards";

export default function Cards({ cards, flipped, selected, onSelected }: { cards: number | number[], flipped?: boolean[], selected?: boolean[], onSelected?: (selected: boolean[]) => any }) {

	function onClick(selected: boolean[], callback: (b: boolean[]) => any, i: number) {
		cardClick();
		selected[i] = !selected[i];
		callback(selected.slice());
	}

	return <div className="cards-component">
		{parse(cards).map((card, i) => <div key={i} className={"card" + (flipped?.[i] ? " flipped" : selected?.[i] ? " selected" : "")} onClick={selected && onSelected && (() => onClick(selected, onSelected, i))}>
			<div className={card.className}>
				<span className="value">{card.value}</span>
				<span className="suit" />
			</div>
		</div>)}
	</div>
}
