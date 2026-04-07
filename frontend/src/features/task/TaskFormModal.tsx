import { Avatar, Button, DatePicker, Form, Input, Modal, Select } from "antd";
import type { Member, Task, TaskPayload, TaskPriority } from "../types/types";
import { useTranslation } from "react-i18next";
import { getInitialDueDate } from "../../lib/date";
import dayjs from "dayjs";

interface Props {
  open: boolean;
  loading: boolean;

  task?: Task;
  members: Member[];

  onSubmit: (payload: TaskPayload) => void;
  onClose: () => void;
}

export function TaskFormModal({
  open,
  loading,
  task,
  members,
  onSubmit,
  onClose,
}: Props) {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={task ? t("edit") : t("addTask")}
      footer={null}
      afterOpenChange={(visible) => {
        form.resetFields();
        if (visible) {
          form.setFieldsValue({
            title: task?.title,
            description: task?.description,
            assigneeId: task?.assigneeId,
            priority: task?.priority,
            dueDate: getInitialDueDate(task),
          });
        }
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) =>
          onSubmit({
            title: values.title,
            description: values.description ?? "",
            status: task?.status ?? "todo",
            assigneeId: values.assigneeId ?? null,
            priority: values.priority as TaskPriority,
            dueDate: values.dueDate
              ? dayjs(values.dueDate).utc().toISOString()
              : null,
          })
        }
      >
        <Form.Item name="title" label={t("title")} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label={t("description")}>
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="assigneeId" label={t("assignee")}>
          <Select
            allowClear
            options={members.map((member) => ({
              label: member.name,
              value: member.id,
            }))}
            showSearch={{
              filterOption: (input, option) =>
                (members.find((m) => m.id === option?.value)?.name ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase()),
            }}
            optionRender={(option) => {
              const member = members.find((m) => m.id === option?.value);
              return (
                <div className="flex items-center gap-2 py-0.5">
                  <Avatar src={member?.avatar} />
                  <span>{member?.name ?? option?.label}</span>
                </div>
              );
            }}
            labelRender={(props) => {
              const id = props?.value as string | undefined;
              if (!id) return null;
              const member = members.find((m) => m.id === id);
              if (!member) return <span>{props?.label}</span>;
              return (
                <div className="flex items-center gap-2">
                  <Avatar src={member.avatar} />
                  <span>{member.name}</span>
                </div>
              );
            }}
          />
        </Form.Item>
        <Form.Item name="priority" label={t("priority")}>
          <Select
            options={["low", "medium", "high"].map((value) => ({
              label: t(value),
              value: value,
            }))}
            defaultValue={"medium"}
          />
        </Form.Item>
        <Form.Item name="dueDate" label={t("dueDate")}>
          <DatePicker showTime className="w-full" />
        </Form.Item>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>{t("cancel")}</Button>
          <Button htmlType="submit" type="primary" loading={loading}>
            {t("save")}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
