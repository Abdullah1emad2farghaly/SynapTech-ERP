import React from 'react'
import { useTranslation } from 'react-i18next';

export default function Optional() {
    const { t } = useTranslation();
    return (
        <span className='text-[var(--ink-tertiary)]'>
            {" "} ({t('common.optional')})
        </span>
    )
}
