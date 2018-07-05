import _ from 'lodash';
import NestedComponent from '../_classes/nested/NestedComponent';

export default class ContainerComponent extends NestedComponent {
  static schema(...extend) {
    return NestedComponent.schema({
      type: 'container',
      key: 'container',
      clearOnHide: true,
      input: true,
      tree: true,
      components: []
    }, ...extend);
  }

  static get builderInfo() {
    return {
      title: 'Container',
      icon: 'folder-open',
      group: 'data',
      documentation: 'http://help.form.io/userguide/#container',
      weight: 10,
      schema: ContainerComponent.schema()
    };
  }

  constructor(...args) {
    super(...args);
    this.type = 'container';
  }

  init() {
    this.components = this.components || [];
    this.addComponents(this.dataValue);
  }

  get defaultSchema() {
    return ContainerComponent.schema();
  }

  get emptyValue() {
    return {};
  }

  get templateName() {
    return 'container';
  }

  hasChanged(before, after) {
    return !_.isEqual(before, after);
  }

  getValue() {
    if (this.viewOnly) {
      return this.dataValue;
    }
    const value = {};
    this.eachComponent((component) => _.set(value, component.key, component.getValue()));
    return value;
  }

  setValue(value, flags) {
    flags = this.getFlags.apply(this, arguments);
    if (!value || !_.isObject(value)) {
      return;
    }
    if (this.hasValue() && _.isEmpty(this.dataValue)) {
      flags.noValidate = true;
    }
    const changed = this.hasChanged(value, this.dataValue);
    this.dataValue = value;
    this.eachComponent((component) => {
      if (component.type === 'components') {
        component.setValue(value, flags);
      }
      else if (_.has(value, component.key)) {
        component.setValue(_.get(value, component.key), flags);
      }
      else {
        component.data = value;
        component.setValue(component.defaultValue, flags);
      }
    });
    this.updateValue(flags);
    return changed;
  }
}
