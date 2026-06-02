import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DatePicker } from "./DatePicker";

const meta: Meta<typeof DatePicker> = {
  title: "Components/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  argTypes: {
    value: { control: false },
    onChange: { action: "onChange" },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    minDate: { control: false },
    maxDate: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

const ControlledTemplate = (args: ComponentProps<typeof DatePicker>) => {
  const [value, setValue] = useState<Date | null>(args.value ?? null);
  return (
    <div style={{ padding: "24px", minHeight: "360px" }}>
      <DatePicker
        {...args}
        value={value}
        onChange={(d) => {
          setValue(d);
          args.onChange?.(d);
        }}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <ControlledTemplate {...args} />,
  args: {
    placeholder: "MM/DD/YYYY",
    disabled: false,
  },
};

export const WithValue: Story = {
  render: (args) => <ControlledTemplate {...args} />,
  args: {
    value: new Date(2026, 4, 6),
    placeholder: "MM/DD/YYYY",
    disabled: false,
  },
};

export const Disabled: Story = {
  render: (args) => (
    <div style={{ padding: "24px" }}>
      <DatePicker {...args} />
    </div>
  ),
  args: {
    value: new Date(2026, 4, 6),
    placeholder: "MM/DD/YYYY",
    disabled: true,
  },
};

export const WithMinMax: Story = {
  render: (args) => <ControlledTemplate {...args} />,
  args: {
    placeholder: "MM/DD/YYYY",
    disabled: false,
    minDate: new Date(2026, 4, 5),
    maxDate: new Date(2026, 4, 20),
  },
};

export const WithDateAndTime: Story = {
  name: "With Date & Time",
  render: () => {
    const [value, setValue] = useState<Date | null>(null);
    return (
      <div
        style={{
          padding: "24px",
          minHeight: "540px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            width: "fit-content",
          }}
        >
          <label
            style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}
          >
            Schedule date &amp; time
          </label>
          <DatePicker
            value={value}
            onChange={setValue}
            placeholder="MM/DD/YYYY HH:MM"
            withTime
            labelConfirm="Valider"
          />
          {value && (
            <p
              style={{
                fontSize: "13px",
                color: "#1B6CFF",
                fontFamily: "Inter, sans-serif",
                margin: "8px 0 0",
              }}
            >
              ✓ Scheduled for{" "}
              {value.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}{" "}
              at {String(value.getHours()).padStart(2, "0")}:
              {String(value.getMinutes()).padStart(2, "0")}
            </p>
          )}
        </div>
      </div>
    );
  },
  args: {},
};

export const WithSegmentedControl: Story = {
  name: "With Segmented Control",
  render: () => {
    const [tab, setTab] = useState("depart");
    const [depart, setDepart] = useState<Date | null>(null);
    const [arrival, setArrival] = useState<Date | null>(null);

    const handleChange = (date: Date) => {
      if (tab === "depart") setDepart(date);
      else setArrival(date);
    };

    return (
      <div
        style={{
          padding: "24px",
          minHeight: "560px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <DatePicker
          value={tab === "depart" ? depart : arrival}
          onChange={handleChange}
          placeholder="MM/DD/YYYY HH:MM"
          withTime
          labelConfirm="Valider"
          segmentedOptions={[
            { value: "depart", label: "Partir à" },
            { value: "arrival", label: "Arrivée à" },
          ]}
          segmentedValue={tab}
          onSegmentChange={setTab}
        />
        {(depart || arrival) && (
          <p style={{ fontSize: "13px", color: "#1B6CFF", margin: "16px 0 0" }}>
            {depart &&
              `✓ Départ : ${depart.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} à ${String(depart.getHours()).padStart(2, "0")}:${String(depart.getMinutes()).padStart(2, "0")}`}
            {depart && arrival && <br />}
            {arrival &&
              `✓ Arrivée : ${arrival.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} à ${String(arrival.getHours()).padStart(2, "0")}:${String(arrival.getMinutes()).padStart(2, "0")}`}
          </p>
        )}
      </div>
    );
  },
  args: {},
};

export const WithLabel: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | null>(null);
    return (
      <div style={{ padding: "24px", minHeight: "360px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            width: "fit-content",
          }}
        >
          <label
            htmlFor="dp-demo"
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: "#374151",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Appointment date
          </label>
          <DatePicker
            {...args}
            value={value}
            onChange={(d) => {
              setValue(d);
              args.onChange?.(d);
            }}
          />
        </div>
      </div>
    );
  },
  args: {
    placeholder: "MM/DD/YYYY",
    disabled: false,
  },
};
