import {PropsWithChildren} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import {Portal} from "next/dist/client/portal";

interface Props extends PropsWithChildren<any> {
	size?: "sm" | "md" | "lg" | number,
	title?: string,
	height?: string,
	onClose?: () => any
}

export default function Modal({ size = "md", title, height, onClose, children }: Props) {
	return <Portal type="div">
		<div className="modal-component">
			<div {...getProperties(size)}>
				<div className="modal-head">
					<div className="title">{title}</div>
					{onClose && <div className="close" onClick={() => onClose()}>
						<FontAwesomeIcon icon={faTimes} />
					</div>}
				</div>
				<div className="modal-body" style={{ height }}>{children}</div>
			</div>
		</div>
	</Portal>
}

function getProperties(size: string | number) {
	if(typeof size === "number") {
		return { className: "modal", style: { width: size + "rem" } };
	} else {
		return { className: "modal " + size };
	}
}
