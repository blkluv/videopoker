import { card as cardClick } from "../utils/audio";
import { Card as ICard, parse } from "../utils/cards";

function Card({ card, name, flipped = false }: { card: ICard, name: string, flipped?: boolean }){
	return <div className={flipped ? "card flipped" : "card"}>
		<input id={name} type="checkbox" name={name} onChange={cardClick} />
		<label htmlFor={name} className={card.className}>
			<span className="value">{card.value}</span>
			<span className="suit" />
		</label>
	</div>
}

export default function Cards({ cards, flipped, selected, onSelected }: { cards: number | number[], flipped?: boolean[], selected?: boolean[], onSelected?: (selected: boolean[]) => any }) {

	function onClick(selected: boolean[], callback: (b: boolean[]) => any, i: number) {
		selected[i] = !selected[i];
		callback(selected.slice());
	}

	return <div className="cards-component">
		{parse(cards).map((card, i) => <div className={"card" + (flipped?.[i] ? " flipped" : selected?.[i] ? " selected" : "")} onClick={selected && onSelected && (() => onClick(selected, onSelected, i))}>
			<div className={card.className}>
				<span className="value">{card.value}</span>
				<span className="suit" />
			</div>
		</div>)}
	</div>
}
