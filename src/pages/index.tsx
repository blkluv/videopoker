import Play from "../components/Play";
import {COIN} from "../utils/env";
import {useRouter} from "next/router";

export default function Index() {

	const router = useRouter();

	return <Play coin={router.query.coin as string || COIN} />
}
