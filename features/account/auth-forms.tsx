"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { APP_ROUTES } from "@/constants/routes";
import { getSafeReturnTo, saveAuthSession } from "@/utils/demo-commerce";
import styles from "./account-pages.module.css";

type AuthMode = "login" | "register";

type FormState = {
  email: string;
  password: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

type SubmitState = {
  mode: AuthMode | null;
  message: string;
  title: string;
  type: "success" | "error" | null;
};

const initialFormState: FormState = {
  email: "",
  password: "",
};

function validate(values: FormState) {
  const errors: FieldErrors = {};
  const trimmedEmail = values.email.trim();

  if (!trimmedEmail) {
    errors.email = "Введите email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.email = "Проверьте формат email.";
  }

  if (!values.password) {
    errors.password = "Введите пароль.";
  } else if (values.password.length < 8) {
    errors.password = "Минимум 8 символов.";
  }

  return errors;
}

function AuthForm({
  helper,
  mode,
  onPasswordReset,
  onSubmit,
  submitState,
}: {
  helper?: string;
  mode: AuthMode;
  onPasswordReset?: (email: string, setErrors: (errors: FieldErrors) => void) => void;
  onSubmit: (mode: AuthMode, values: FormState, setErrors: (errors: FieldErrors) => void) => void;
  submitState: SubmitState;
}) {
  const [values, setValues] = useState(initialFormState);
  const [errors, setErrors] = useState<FieldErrors>({});
  const isLoading = submitState.mode === mode && submitState.type === null;
  const isLogin = mode === "login";
  const titleId = `${mode}-title`;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit(mode, values, setErrors);
  }

  return (
    <section className={styles.formPanel} aria-labelledby={titleId}>
      <h2 id={titleId}>{isLogin ? "Вход" : "Регистрация"}</h2>
      <form className={styles.formGrid} noValidate onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>Email</span>
          <input
            aria-describedby={errors.email ? `${mode}-email-error` : undefined}
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            name="email"
            onChange={(event) => {
              setValues((current) => ({ ...current, email: event.target.value }));
              setErrors((current) => ({ ...current, email: undefined }));
            }}
            placeholder="name@example.com"
            type="email"
            value={values.email}
          />
          {errors.email ? (
            <span className={styles.fieldError} id={`${mode}-email-error`}>
              {errors.email}
            </span>
          ) : null}
        </label>
        <label className={styles.field}>
          <span>Пароль</span>
          <input
            aria-describedby={errors.password ? `${mode}-password-error` : undefined}
            aria-invalid={Boolean(errors.password)}
            autoComplete={isLogin ? "current-password" : "new-password"}
            name="password"
            onChange={(event) => {
              setValues((current) => ({ ...current, password: event.target.value }));
              setErrors((current) => ({ ...current, password: undefined }));
            }}
            placeholder={isLogin ? "Введите пароль" : "Минимум 8 символов"}
            type="password"
            value={values.password}
          />
          {errors.password ? (
            <span className={styles.fieldError} id={`${mode}-password-error`}>
              {errors.password}
            </span>
          ) : null}
        </label>
        {isLogin ? (
          <button
            className={styles.forgotPassword}
            type="button"
            onClick={() => onPasswordReset?.(values.email, setErrors)}
          >
            Забыли пароль?
          </button>
        ) : null}
        {helper ? <p className={styles.helperText}>{helper}</p> : null}
        <button className={styles.plainButton} disabled={isLoading} type="submit">
          {isLoading ? "Проверяем…" : isLogin ? "Войти" : "Создать аккаунт"}
        </button>
        {submitState.mode === mode && submitState.type ? (
          <div className={styles.authMessage} data-type={submitState.type} role="status">
            <strong>{submitState.title}</strong>
            <span>{submitState.message}</span>
          </div>
        ) : null}
      </form>
    </section>
  );
}

export function AuthForms() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("register");
  const [submitState, setSubmitState] = useState<SubmitState>({
    message: "",
    mode: null,
    title: "",
    type: null,
  });
  const returnTo = useMemo(() => getSafeReturnTo(APP_ROUTES.profile), []);

  function handleSubmit(
    mode: AuthMode,
    values: FormState,
    setErrors: (errors: FieldErrors) => void,
  ) {
    setSubmitState({
      message: "",
      mode,
      title: "",
      type: null,
    });

    window.setTimeout(() => {
      try {
        saveAuthSession(values.email.trim());
        setSubmitState({
          message: mode === "login" ? "Можно продолжить покупку." : "Добро пожаловать в Locker.",
          mode,
          title: mode === "login" ? "Вы вошли" : "Аккаунт создан",
          type: "success",
        });

        window.setTimeout(() => {
          router.push(returnTo);
        }, 650);
      } catch {
        setErrors({});
        setSubmitState({
          message: "Попробуйте ещё раз.",
          mode,
          title: "Не получилось выполнить действие",
          type: "error",
        });
      }
    }, 700);
  }

  function handlePasswordReset(email: string, setErrors: (errors: FieldErrors) => void) {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrors({ email: "Введите email для восстановления." });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrors({ email: "Проверьте формат email." });
      return;
    }

    setErrors({});
    setSubmitState({
      message: "Если email есть в системе, мы отправим ссылку для восстановления.",
      mode: "login",
      title: "Инструкция отправлена",
      type: "success",
    });
  }

  const isLogin = mode === "login";

  return (
    <div className={styles.authStack}>
      <AuthForm
        helper={isLogin ? undefined : "После регистрации откроется нужный шаг."}
        key={mode}
        mode={mode}
        onPasswordReset={handlePasswordReset}
        onSubmit={handleSubmit}
        submitState={submitState}
      />
      <button className={styles.authSwitch} type="button" onClick={() => setMode(isLogin ? "register" : "login")}>
        <span>{isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}</span>
        <strong>{isLogin ? "Зарегистрироваться" : "Войти"}</strong>
      </button>
    </div>
  );
}
