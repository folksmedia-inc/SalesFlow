import { App, Avatar, Button, Card, Dropdown, Result, Space, Tabs, Typography } from 'antd'
import { Link2, MoreHorizontal, Pencil, Power, Trash2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { FieldValues } from 'react-hook-form'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { avatarColor } from '@/utils/avatar'
import { StatusTag } from '@/components/common/StatusTag'
import { useEntityRecord } from '@/hooks/useEntityData'
import { useLookups } from '@/hooks/useLookups'
import type { EntityKey } from '@/store/entities/types'
import { getInitials } from '@/utils/format'
import { DetailSections } from './DetailSections'
import { EntityFormDrawer } from './EntityFormDrawer'
import type { EntityConfig } from './types'
import { useEntityActions } from './useEntityActions'
import styles from './EntityDetailsPage.module.scss'

interface EntityDetailsPageProps<K extends EntityKey, V extends FieldValues> {
  config: EntityConfig<K, V>
  /** Extra buttons next to Edit. */
  extraActions?: ReactNode
  /** Content rendered above the Overview sections (e.g. KPI cards). */
  overviewPrefix?: ReactNode
}

/**
 * Generic record page: header with avatar, status and actions, then tabs —
 * Overview (from `detailSections`) plus any `detailTabs` the config adds.
 */
export function EntityDetailsPage<K extends EntityKey, V extends FieldValues>({ config, extraActions, overviewPrefix }: EntityDetailsPageProps<K, V>) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { message } = App.useApp()
  const lookups = useLookups()
  const record = useEntityRecord(config.key, id)
  const { requestDelete, statusToggle } = useEntityActions(config)
  const [params, setParams] = useSearchParams()
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (!record) {
    if (deleting) return null
    return (
      <Result
        status="404"
        title={`${config.singular} not found`}
        subTitle={`This ${config.singular.toLowerCase()} doesn't exist or has been deleted.`}
        extra={
          <Button type="primary" onClick={() => navigate(config.basePath)}>
            Back to {config.label}
          </Button>
        }
      />
    )
  }

  const Icon = config.icon
  const title = config.getTitle(record)
  const toggle = statusToggle(record)
  const activeTab = params.get('tab') ?? 'overview'

  const edit = () => (config.formMode === 'page' ? navigate(`${config.basePath}/${record.id}/edit`) : setEditing(true))

  const tabs = [
    {
      key: 'overview',
      label: 'Overview',
      children: (
        <div className={styles.overview}>
          {overviewPrefix}
          {config.detailSections && <DetailSections sections={config.detailSections} record={record} lookups={lookups} />}
        </div>
      ),
    },
    ...(config.detailTabs?.(record) ?? []),
  ]

  return (
    <>
      <div className={styles.breadcrumbs}>
        <Breadcrumbs labels={{ [`${config.basePath}/${record.id}`]: title }} />
      </div>

      <Card className={styles.headerCard}>
        <div className={styles.header}>
          <Avatar
            size={64}
            className={styles.avatar}
            style={{ background: config.avatar === 'initials' ? avatarColor(title) : 'var(--app-color-primary-bg)', color: config.avatar === 'initials' ? '#fff' : 'var(--app-color-primary)' }}
            icon={config.avatar === 'initials' ? undefined : <Icon size={28} />}
          >
            {config.avatar === 'initials' ? getInitials(title) : undefined}
          </Avatar>
          <div className={styles.identity}>
            <div className={styles.titleRow}>
              <Typography.Title level={3} className={styles.title}>
                {title}
              </Typography.Title>
              {config.getStatus && <StatusTag status={config.getStatus(record)} />}
            </div>
            {config.getSubtitle && <div className={styles.subtitle}>{config.getSubtitle(record, lookups)}</div>}
            {config.getMeta && (
              <div className={styles.meta}>
                {config.getMeta(record, lookups).map((item, index) => (
                  <span key={index}>{item}</span>
                ))}
              </div>
            )}
          </div>
          <Space wrap className={styles.actions}>
            {extraActions}
            <Button type="primary" icon={<Pencil size={16} />} onClick={edit}>
              Edit
            </Button>
            {toggle && (
              <Button icon={<Power size={16} />} onClick={toggle.run}>
                {toggle.label}
              </Button>
            )}
            <Button
              danger
              icon={<Trash2 size={16} />}
              onClick={() =>
                requestDelete(record, () => {
                  setDeleting(true)
                  navigate(config.basePath, { replace: true })
                })
              }
            >
              Delete
            </Button>
            <Dropdown
              trigger={['click']}
              menu={{
                items: [
                  {
                    key: 'copy',
                    icon: <Link2 size={14} />,
                    label: 'Copy link',
                    onClick: () => {
                      void navigator.clipboard?.writeText(window.location.href)
                      message.success('Link copied to clipboard.')
                    },
                  },
                ],
              }}
            >
              <Button icon={<MoreHorizontal size={16} />} aria-label="More actions" />
            </Dropdown>
          </Space>
        </div>
      </Card>

      <Tabs
        className={styles.tabs}
        activeKey={activeTab}
        onChange={(key) =>
          setParams(
            (current) => {
              const next = new URLSearchParams(current)
              if (key === 'overview') next.delete('tab')
              else next.set('tab', key)
              return next
            },
            { replace: true },
          )
        }
        items={tabs}
      />

      {config.formMode === 'drawer' && <EntityFormDrawer config={config} open={editing} record={record} onClose={() => setEditing(false)} />}
    </>
  )
}
