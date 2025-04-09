// GENERATE BY script
// DON NOT EDIT IT MANUALLY

import * as React from 'react';
import data from './Xlsx.json';
import IconBase, { IconBaseProps, IconData } from '@/components/base/icon/IconBase';

const Icon = React.forwardRef<React.MutableRefObject<SVGElement>, Omit<IconBaseProps, 'data'>>((
  props,
  ref
) => <IconBase {...props} ref={ref} data={data as unknown as IconData} />);

Icon.displayName = 'Xlsx';

export default Icon;
