// React
import { MouseEventHandler, FormEvent, useState, useEffect } from "react";

// Libs
import classnames from "classnames";

// Components
import { HUDWindow } from "../../../components/HUDWindow";
import { Form } from "../../../components/Form";
import { HUDInput } from "../../../components/HUDInput";
import { HUDButton } from "../../../components/HUDButton";
import { Flexbox } from "../../../components/Flexbox";
import { HUDAutoComplete } from "../../../components/HUDAutoComplete";

// Context
import { useCurrentPlanet } from "../../../contexts/SpaceTravelContext";

// API
import {
  CreateUpdateAstronautRequestBody,
  Astronaut,
} from "../../../api/astronaut.api";
import { getPlanetListByNameAPICall } from "../../../api/planet.api";

// Styles
import styles from "./AstronautForm.module.css";

type AstronautFormProps = {
  astronautForUpdate?: Astronaut | null;
  className?: string;
  mode?: string;
  onCancel: MouseEventHandler<HTMLButtonElement>;
  onSubmit: (astronaut: CreateUpdateAstronautRequestBody) => void;
};

type FormStateType = {
  firstname?: string;
  lastname?: string;
  planet?: string;
};

export function AstronautForm({
  astronautForUpdate,
  className,
  mode = "create",
  onCancel,
  onSubmit,
}: AstronautFormProps) {
  const componentClassNames = classnames(styles.astronautform, className);
  const { currentPlanet } = useCurrentPlanet();
  const canCreate =
    mode === "create" &&
    currentPlanet !== "NO_WHERE" &&
    currentPlanet?.isHabitable;

  const [formState, setFormState] = useState<FormStateType>({});
  const [astronautFirstname, setAstronautFirstname] = useState("");
  const [astronautLastname, setAstronautLastname] = useState("");
  const [selectedPlanet, setSelectedPlanet] = useState({
    label: "",
    value: "",
  });

  useEffect(() => {
    if (astronautForUpdate) {
      setAstronautFirstname(astronautForUpdate.firstname);
      setAstronautLastname(astronautForUpdate.lastname);
      setSelectedPlanet({
        label: astronautForUpdate.originPlanet?.name,
        value: astronautForUpdate.originPlanet?.id.toString() || "",
      });
    } else {
      setAstronautFirstname("");
      setAstronautLastname("");
      setSelectedPlanet({ label: "Select a Planet", value: "" });
    }
  }, [astronautForUpdate]);

  const validateAndSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors: FormStateType = {};
    if (!astronautFirstname.trim())
      validationErrors.firstname = "Firstname is required";
    if (!astronautLastname.trim())
      validationErrors.lastname = "Lastname is required";
    if (astronautFirstname.trim().length < 2)
      validationErrors.firstname = "Firstname must be at least 2 characters";
    if (mode === "edit" && !selectedPlanet.value)
      validationErrors.planet = "Planet of origin is required";

    if (Object.keys(validationErrors).length === 0) {
      onSubmit({
        firstname: astronautFirstname,
        lastname: astronautLastname,
        originPlanetId: parseInt(selectedPlanet.value),
      });
    } else {
      setFormState(validationErrors);
    }
  };

  return (
    <Flexbox className={componentClassNames} flexDirection="column">
      <HUDWindow>
        {mode === "create" ? (
          <h2>Create an Astronaut</h2>
        ) : (
          <h2>Edit an Astronaut</h2>
        )}
        <Form
          onSubmit={validateAndSubmit}
          className={styles.astronautformForm}
          noValidate
        >
          <HUDInput
            name="firstname"
            label="Firstname"
            placeholder="John"
            required
            value={astronautFirstname}
            error={formState.firstname}
            onChange={(e) => setAstronautFirstname(e.target.value)}
          />
          <HUDInput
            name="lastname"
            label="Lastname"
            placeholder="Doe"
            required
            value={astronautLastname}
            error={formState.lastname}
            onChange={(e) => setAstronautLastname(e.target.value)}
          />
          {mode === "edit" && (
            <HUDAutoComplete
              name="planet"
              label="Planet of Origin"
              placeholder={selectedPlanet.label}
              error={formState.planet}
              fetchOptions={getPlanetListByNameAPICall}
              defaultValue={selectedPlanet}
              onChange={(newPlanet) => setSelectedPlanet(newPlanet)}
            />
          )}
          <Flexbox
            className={styles.astronautformButtons}
            alignItems="center"
            justifyContent="center"
          >
            <HUDButton onClick={onCancel}>CANCEL</HUDButton>
            {mode === "create" ? (
              <HUDButton disabled={!canCreate}>CREATE</HUDButton>
            ) : (
              <HUDButton>EDIT</HUDButton>
            )}
          </Flexbox>
        </Form>
      </HUDWindow>
      {mode !== "edit" && !canCreate && (
        <HUDWindow className={styles.astronautformCannotCreate}>
          <h2>Warning!</h2>
          <p>
            Cannot create an astronaut because the current planet does not
            shelter life.
          </p>
          <p>Travel to another planet to add an astronaut.</p>
        </HUDWindow>
      )}
    </Flexbox>
  );
}
