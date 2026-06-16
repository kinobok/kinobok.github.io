import { test, expect, describe, vi } from "vitest";
import React from "react";
import UpdateReminderModal from "../components/UpdateReminderModal";

describe("UpdateReminderModal", () => {
  test("returns null when isOpen is false", () => {
    const result = UpdateReminderModal({
      isOpen: false,
      lastUploadDate: "June 10, 2026",
      onClose: () => {},
      onUpload: () => {},
    });
    expect(result).toBeNull();
  });

  test("renders modal structure when isOpen is true", () => {
    const onClose = vi.fn();
    const onUpload = vi.fn();
    const result = UpdateReminderModal({
      isOpen: true,
      lastUploadDate: "June 10, 2026",
      onClose,
      onUpload,
    });

    expect(result).not.toBeNull();
    // Root element should be the modal overlay
    expect(result.type).toBe("div");
    expect(result.props.className).toBe("modal-overlay");

    // Content container should be inside
    const content = result.props.children;
    expect(content.type).toBe("div");
    expect(content.props.className).toBe("modal-content onboarding-modal");

    // Verify last upload date is mentioned in the body
    const body = content.props.children.find(
      (child: any) =>
        child && child.props && child.props.className === "modal-body",
    );
    expect(body).toBeDefined();
  });

  test("stops propagation when content container is clicked", () => {
    const result = UpdateReminderModal({
      isOpen: true,
      lastUploadDate: "June 10, 2026",
      onClose: () => {},
      onUpload: () => {},
    });

    const content = result.props.children;
    const mockEvent = {
      stopPropagation: vi.fn(),
    };
    content.props.onClick(mockEvent);
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });

  test("triggers onUpload when file is selected", () => {
    const onClose = vi.fn();
    const onUpload = vi.fn();
    const result = UpdateReminderModal({
      isOpen: true,
      lastUploadDate: "June 10, 2026",
      onClose,
      onUpload,
    });

    const content = result.props.children;
    const body = content.props.children.find(
      (child: any) =>
        child && child.props && child.props.className === "modal-body",
    );
    const actions = body.props.children.find(
      (child: any) =>
        child && child.props && child.props.className === "onboarding-actions",
    );
    const input = actions.props.children.find(
      (child: any) => child && child.props && child.props.type === "file",
    );

    const mockFile = new File(["test"], "watchlist.csv", { type: "text/csv" });
    input.props.onChange({
      target: {
        files: [mockFile],
      },
    });

    expect(onUpload).toHaveBeenCalledWith(mockFile);
  });

  test("does not trigger onUpload when target.files is empty or null", () => {
    const onClose = vi.fn();
    const onUpload = vi.fn();
    const result = UpdateReminderModal({
      isOpen: true,
      lastUploadDate: "June 10, 2026",
      onClose,
      onUpload,
    });

    const content = result.props.children;
    const body = content.props.children.find(
      (child: any) =>
        child && child.props && child.props.className === "modal-body",
    );
    const actions = body.props.children.find(
      (child: any) =>
        child && child.props && child.props.className === "onboarding-actions",
    );
    const input = actions.props.children.find(
      (child: any) => child && child.props && child.props.type === "file",
    );

    input.props.onChange({
      target: {
        files: null,
      },
    });

    expect(onUpload).not.toHaveBeenCalled();
  });
});
