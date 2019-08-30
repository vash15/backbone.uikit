import _ from "underscore";
import $ from "jquery";
import context from "context-utils";
import TextField from "./TextField";

const STATUS_INSECURE     = 'insecure';
const STATUS_NOT_INSECURE = 'not_insecure';
const STATUS_SECURE       = 'secure';

const VISIBILITY_SHOWN  = 'shown';
const VISIBILITY_HIDDEN = 'hidden';

const PASSWORD_VALID            = 'valid';
const PASSWORD_EMPTY            = 'empty';
const PASSWORD_SHORT            = 'short';
const PASSWORD_NO_DIGIT         = 'no_digit';
const PASSWORD_NO_SPECIAL_CHARS = 'no_special_chars';
const PASSWORD_NO_UPPERCASE     = 'no_uppercase';
const PASSWORD_NO_LOWERCASE     = 'no_lowercase';

export default class PasswordField extends TextField {

	constructor(options) {
		super(options);

		this.setDefaultsOptions({
			status: STATUS_INSECURE,
			visibility: VISIBILITY_SHOWN,
			evaluateLenght: 8,
			evaluateDigit: true,
			evaluateSpecialChars: true,
			evaluateUppercaseLowercase: false,
			specialCharsRegexp: /[!#$%&? "]/,
			digitRegexp: /[\d]/,
			uppercaseRegexp: /[A-Z]/,
			lowercaseRegexp: /[a-z]/
		});

		this.addEvents({
			'input input': 'onChange'
		});

		this.$el.addClass('password-field');
	}

	onRender(rendered) {
		super.onRender(rendered);
		if (!rendered) {
			this.cache.$securityIndicator = $('<div class="security-indicator">');
			this.cache.$securityIndicator.append('<span class="step insecure"></span>');
			this.cache.$securityIndicator.append('<span class="step not-insecure"></span>');
			this.cache.$securityIndicator.append('<span class="step secure"></span>');
			this.$el.append(this.cache.$securityIndicator);

			this.cache.$securityLabel = $('<div class="security-label">');
			this.$el.append(this.cache.$securityLabel);
		}
		this.updateStatusFromInput();
	}

	onChange(e) {
		super.onChange(e);
		this.updateStatusFromInput();
	}

	changeStatus(newStatus) {
		const oldStatus = this.status;
		this.status = newStatus;
		switch (newStatus) {
			case STATUS_INSECURE:
				this.$el.addClass('status-insecure');
				this.$el.removeClass('status-not-insecure');
				this.$el.removeClass('status-secure');
				break;

			case STATUS_NOT_INSECURE:
				this.$el.removeClass('status-insecure');
				this.$el.addClass('status-not-insecure');
				this.$el.removeClass('status-secure');
				break;

			case STATUS_SECURE:
				this.$el.removeClass('status-insecure');
				this.$el.removeClass('status-not-insecure');
				this.$el.addClass('status-secure');
				break;
		}
		if (oldStatus != newStatus)
			this.trigger('change:status', newStatus);
	}

	updateStatusFromInput() {
		const passwordEvaluation = this.cache.lastPasswordEvaluation = this.evaluatePassword(this.getValue());
		switch (passwordEvaluation) {
			case PASSWORD_EMPTY:
			case PASSWORD_SHORT:
				this.changeStatus(STATUS_INSECURE);
				break;

			case PASSWORD_VALID:
				this.changeStatus(STATUS_SECURE);
				break;

			default:
				this.changeStatus(STATUS_NOT_INSECURE);
				break;
		}
		this.trigger('change:password', passwordEvaluation);
	}

	evaluatePassword(password) {
		if (password.length === 0)
			return PASSWORD_EMPTY;

		if (this.options.evaluateLenght > 0 && password.length < this.options.evaluateLenght)
			return PASSWORD_SHORT;

		if (this.options.evaluateDigit && password.search(this.options.digitRegexp) === -1)
			return PASSWORD_NO_DIGIT;

		if (this.options.evaluateUppercaseLowercase && password.search(this.options.lowercaseRegexp) === -1)
			return PASSWORD_NO_LOWERCASE;

		if (this.options.evaluateUppercaseLowercase && password.search(this.options.uppercaseRegexp) === -1)
			return PASSWORD_NO_UPPERCASE;

		if (this.options.evaluateSpecialChars && password.search(this.options.specialCharsRegexp) === -1)
			return PASSWORD_NO_SPECIAL_CHARS;

		return PASSWORD_VALID;
	}

	changeSecurityLabel(newLabel) {
		if (!this.cache.$securityLabel)
			return;

		this.cache.$securityLabel.text(newLabel);
	}

}

PasswordField.STATUS_INSECURE     = STATUS_INSECURE;
PasswordField.STATUS_NOT_INSECURE = STATUS_NOT_INSECURE;
PasswordField.STATUS_SECURE       = STATUS_SECURE;

PasswordField.VISIBILITY_SHOWN    = VISIBILITY_SHOWN;
PasswordField.VISIBILITY_HIDDEN   = VISIBILITY_HIDDEN;

PasswordField.PASSWORD_VALID            = PASSWORD_VALID;
PasswordField.PASSWORD_EMPTY            = PASSWORD_EMPTY;
PasswordField.PASSWORD_SHORT            = PASSWORD_SHORT;
PasswordField.PASSWORD_NO_DIGIT         = PASSWORD_NO_DIGIT;
PasswordField.PASSWORD_NO_SPECIAL_CHARS = PASSWORD_NO_SPECIAL_CHARS;
PasswordField.PASSWORD_NO_UPPERCASE     = PASSWORD_NO_UPPERCASE;
PasswordField.PASSWORD_NO_LOWERCASE     = PASSWORD_NO_LOWERCASE;
