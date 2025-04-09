import React, { forwardRef } from 'react';

export type IconData = {
  name: string
  icon: AbstractNode
}

export type IconBaseProps = {
  data: IconData
  className?: string
  onClick?: React.MouseEventHandler<SVGElement>
  style?: React.CSSProperties
}

export type AbstractNode = {
  name: string
  attributes: {
    [key: string]: string
  }
  children?: AbstractNode[]
}

export type Attrs = {
  [key: string]: string
}

function normalizeAttrs(attrs: Attrs = {}): Attrs {
  return Object.keys(attrs).reduce((acc: Attrs, key) => {
    const val = attrs[key];
    key = key.replace(/([-]\w)/g, (g: string) => g[1].toUpperCase());
    key = key.replace(/([:]\w)/g, (g: string) => g[1].toUpperCase());
    switch (key) {
      case 'class':
        acc.className = val;
        delete acc.class;
        break;
      case 'style':
        (acc.style as any) = val.split(';').reduce((prev, next) => {
          const pairs = next?.split(':');

          if(pairs[0] && pairs[1]) {
            const k = pairs[0].replace(/([-]\w)/g, (g: string) => g[1].toUpperCase());
            prev[k] = pairs[1];
          }

          return prev;
        }, {} as Attrs);
        break;
      default:
        acc[key] = val;
    }
    return acc;
  }, {});
}

function generate(
  node: AbstractNode,
  key: string,
  rootProps?: { [key: string]: any } | false
): any {
  if(!rootProps) {
    return React.createElement(
      node.name,
      { key, ...normalizeAttrs(node.attributes) },
      (node.children || []).map((child, index) => generate(child, `${key}-${node.name}-${index}`))
    );
  }

  return React.createElement(
    node.name,
    {
      key,
      ...normalizeAttrs(node.attributes),
      ...rootProps
    },
    (node.children || []).map((child, index) => generate(child, `${key}-${node.name}-${index}`))
  );
}

const IconBase = forwardRef<React.MutableRefObject<HTMLOrSVGElement>, IconBaseProps>((props, ref) => {
  const { data, className, onClick, style, ...restProps } = props;

  return generate(data.icon, `svg-${data.name}`, {
    className,
    onClick,
    style,
    'data-icon': data.name,
    'aria-hidden': 'true',
    ...restProps,
    'ref': ref
  });
});

IconBase.displayName = 'IconBase';

export default IconBase;
