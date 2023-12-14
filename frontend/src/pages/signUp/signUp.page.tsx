import {OrgCreationRequest, AgentCreationRequest} from "../../../../shared/objects/org";
import {apiFetch} from "../../helpers/apiFetch";
import {useState} from "react";
import {LabelledInput, SearchableInput} from "../../components/inputs";
import {timezones} from "../../../../shared/objects/timezones";
import {org as orgRegex, agent as agentRegex} from "../../../../shared/objects/validationRegex";
import {useNotifStore} from "../../stores/notifs";
import {useNavigate} from "react-router-dom";
import coreStyles from "../../core.module.css";
import styles from "./signUp.module.css";

export default function SignUp() {
	const notifs = useNotifStore();
	const navigate = useNavigate();

	const [page, setPage] = useState<number>(1);
	const pageLabelledInputValidators: (() => boolean)[] = [
		() => Boolean(org.name && org.color && org.timezone),
		() => Boolean(agent.name && agent.department && agent.countryCode),
	];
	const pageCount = pageLabelledInputValidators.length;

	const [org, setOrg] = useState<OrgCreationRequest>({
		name: "",
		color: getComputedStyle(document.body).getPropertyValue("--backgroundColor"),
		timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
	});
	const [agent, setAgent] = useState<AgentCreationRequest>({
		name: "",
		department: "",
		countryCode: "",
		internals: {permissions: {}},
	});

	function validatePageLabelledInputs() {
		const validation = pageLabelledInputValidators[page - 1]();

		if (!validation) {
			notifs.create({
				text: "Please ensure all fields are filled",
				desirability: false,
			});
		}

		return validation;
	}

	async function submit() {
		const response = await apiFetch("POST", "/orgs", {agent, org: {...org, color: org.color.slice(1)}});

		if (response.error?.message) {
			notifs.create({
				text: response.error.message,
				desirability: false,
				manualDismiss: true,
			});
			return;
		}

		navigate("/dashboard");
	}

	return (
		<section id={styles.signUpWrapper}>
			<h2>Sign Up</h2>
			<form>
				<div id={styles.pagesWrapper}>
					{page === 1 && (
						<section className={styles.page}>
							<h3>Organization Data</h3>
							<h4></h4>
							<LabelledInput
								id={"orgNameInput"}
								label={"Name"}
								collapsedLabel={true}
								defaultValue={org.name}
								pattern={orgRegex.name}
								required={true}
								handler={(val) => setOrg({...org, name: val})}
							/>
							<LabelledInput
								id={"orgColorInput"}
								type={"color"}
								defaultValue={org.color}
								pattern={orgRegex.color}
								label={"Color"}
								required={true}
								handler={(val) => setOrg({...org, color: val})}
							/>
							<SearchableInput
								id={"orgTimezoneInput"}
								defaultValue={org.timezone}
								collapsedLabel={true}
								type={"search"}
								labelled={true}
								label={"Timezone"}
								pattern={orgRegex.timezone} // has hilariously large HTML output, but i think it's worth it
								required={true}
								handler={(zone) => {
									try {
										new Date().toLocaleString([], {timeZone: zone});
									} catch (err) {
										return;
									}
									setOrg({...org, timezone: zone});
								}}
								options={timezones}
							/>
						</section>
					)}
					{page === 2 && (
						<section className={styles.page}>
							<h3>Your Data</h3>
							<LabelledInput
								id={"agentNameInput"}
								label={"Name"}
								collapsedLabel={true}
								defaultValue={agent.name}
								pattern={agentRegex.name}
								required={true}
								handler={(val) => setAgent({...agent, name: val})}
							/>
							<LabelledInput
								id={"agentDepartmentInput"}
								label={"Department"}
								collapsedLabel={true}
								defaultValue={agent.department}
								pattern={agentRegex.department}
								required={true}
								handler={(val) => setAgent({...agent, department: val})}
							/>
							<LabelledInput
								id={"agentCountryCodeInput"}
								label={"Country Code (Phone)"}
								type={"number"}
								collapsedLabel={true}
								defaultValue={agent.countryCode}
								pattern={agentRegex.countryCode}
								required={true}
								handler={(val) => setAgent({...agent, countryCode: val})}
							/>
						</section>
					)}
				</div>
				<div id={styles.buttonsWrapper}>
					{page > 1 && (
						<button id="prevPage" className={coreStyles.borderButton} type="button" onClick={() => setPage(page - 1)}>
							Previous
						</button>
					)}
					{page < pageCount ? (
						<button
							id="nextPage"
							className={coreStyles.borderButton}
							type="button"
							onClick={() => validatePageLabelledInputs() && setPage(page + 1)}
						>
							Next
						</button>
					) : (
						<button
							id="submitSignUp"
							className={coreStyles.backgroundButton}
							type="button"
							onClick={() => validatePageLabelledInputs() && submit()}
						>
							Submit
						</button>
					)}
				</div>
			</form>
			<section id="invitePreview">
				{/* will be replaced with the same component as the recipient-view invite, for preview during registration */}
			</section>
		</section>
	);
}
