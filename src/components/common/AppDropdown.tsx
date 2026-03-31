import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';

interface DropdownOption {
  id: string;
  label: string;
  icon?: string;
  subtitle?: string;
}

interface AppDropdownProps {
  label?: string;
  placeholder: string;
  options: DropdownOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  style?: ViewStyle;
}

export const AppDropdown: React.FC<AppDropdownProps> = ({
  label,
  placeholder,
  options,
  selectedId,
  onSelect,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((o) => o.id === selectedId);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.trigger, isOpen && styles.triggerFocused]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <View style={styles.triggerContent}>
          {selected?.icon && <Text style={styles.icon}>{selected.icon}</Text>}
          <Text
            style={[
              styles.triggerText,
              !selected && styles.placeholderText,
            ]}
          >
            {selected ? selected.label : placeholder}
          </Text>
        </View>
        <Text style={styles.chevron}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || placeholder}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.id === selectedId && styles.optionSelected,
                  ]}
                  onPress={() => {
                    onSelect(item.id);
                    setIsOpen(false);
                  }}
                >
                  {item.icon && <Text style={styles.optionIcon}>{item.icon}</Text>}
                  <View style={styles.optionTextContainer}>
                    <Text
                      style={[
                        styles.optionText,
                        item.id === selectedId && styles.optionTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.subtitle && (
                      <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
                    )}
                  </View>
                  {item.id === selectedId && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    minHeight: 48,
  },
  triggerFocused: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  triggerText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  placeholderText: {
    color: Colors.textTertiary,
  },
  chevron: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginLeft: Spacing.sm,
  },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '60%',
    paddingBottom: Spacing.xxxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  closeButton: {
    fontSize: 18,
    color: Colors.textSecondary,
    padding: Spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.md,
  },
  optionSelected: {
    backgroundColor: Colors.successLight,
  },
  optionIcon: {
    fontSize: 24,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  optionTextSelected: {
    color: Colors.primaryDark,
    fontWeight: '600',
  },
  optionSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  checkmark: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '700',
  },
});
