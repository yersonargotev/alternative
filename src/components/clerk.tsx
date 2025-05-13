import {
	SignInButton,
	SignUpButton,
	SignedIn,
	SignedOut,
	UserButton,
} from "@clerk/nextjs";

export default function Clerk() {
	return (
		<>
			<SignedOut>
				<SignInButton />
				<SignUpButton />
			</SignedOut>
			<SignedIn>
				<UserButton />
			</SignedIn>
		</>
	);
}
