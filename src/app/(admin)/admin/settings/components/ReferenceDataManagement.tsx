import { useState, useEffect } from 'react'
import { Row, Col, Button, Form, Table, Modal, Badge } from 'react-bootstrap'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'react-toastify'

interface ReferenceDataItem {
  id: string
  category: string
  code: string
  name_nl: string
  name_en?: string
  description?: string
  sort_order: number
  is_active: boolean
  parent_code?: string
}

const ReferenceDataManagement = () => {
  const [data, setData] = useState<ReferenceDataItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [editingItem, setEditingItem] = useState<ReferenceDataItem | null>(null)

  const categories = [
    'DOCUMENT_TYPE',
    'APPLICATION_STATE',
    'PROPERTY_TYPE',
    'MARITAL_STATUS',
    'EMPLOYMENT_STATUS',
    'DISTRICT',
    'TITLE_TYPE',
  ]

  useEffect(() => {
    loadReferenceData()
  }, [selectedCategory])

  const loadReferenceData = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('reference_data')
        .select('*')
        .order('category')
        .order('sort_order')

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      const { data: refData, error } = await query

      if (error) throw error
      setData(refData || [])
    } catch (error: any) {
      toast.error(`Failed to load reference data: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (formData: Partial<ReferenceDataItem>) => {
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('reference_data')
          .update(formData)
          .eq('id', editingItem.id)
        
        if (error) throw error
        toast.success('Reference data updated successfully')
      } else {
        const { error } = await supabase
          .from('reference_data')
          .insert([formData])
        
        if (error) throw error
        toast.success('Reference data created successfully')
      }

      setShowModal(false)
      setEditingItem(null)
      loadReferenceData()
    } catch (error: any) {
      toast.error(`Failed to save: ${error.message}`)
    }
  }

  const handleToggleActive = async (item: ReferenceDataItem) => {
    try {
      const { error } = await supabase
        .from('reference_data')
        .update({ is_active: !item.is_active })
        .eq('id', item.id)

      if (error) throw error
      toast.success(`Reference data ${!item.is_active ? 'activated' : 'deactivated'}`)
      loadReferenceData()
    } catch (error: any) {
      toast.error(`Failed to update status: ${error.message}`)
    }
  }

  return (
    <div>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace(/_/g, ' ')}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={6} className="text-end">
          <Button variant="primary" onClick={() => { setEditingItem(null); setShowModal(true); }}>
            <i className="mdi mdi-plus me-1"></i>
            Add Reference Data
          </Button>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Category</th>
            <th>Code</th>
            <th>Name (NL)</th>
            <th>Name (EN)</th>
            <th>Sort Order</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} className="text-center">Loading...</td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center">No reference data found</td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.id}>
                <td>{item.category}</td>
                <td><code>{item.code}</code></td>
                <td>{item.name_nl}</td>
                <td>{item.name_en || '-'}</td>
                <td>{item.sort_order}</td>
                <td>
                  <Badge bg={item.is_active ? 'success' : 'secondary'}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="me-1"
                    onClick={() => { setEditingItem(item); setShowModal(true); }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant={item.is_active ? 'outline-warning' : 'outline-success'}
                    onClick={() => handleToggleActive(item)}
                  >
                    {item.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <ReferenceDataModal
        show={showModal}
        item={editingItem}
        categories={categories}
        onHide={() => { setShowModal(false); setEditingItem(null); }}
        onSave={handleSave}
      />
    </div>
  )
}

interface ModalProps {
  show: boolean
  item: ReferenceDataItem | null
  categories: string[]
  onHide: () => void
  onSave: (data: Partial<ReferenceDataItem>) => void
}

const ReferenceDataModal = ({ show, item, categories, onHide, onSave }: ModalProps) => {
  const [formData, setFormData] = useState<Partial<ReferenceDataItem>>({
    category: '',
    code: '',
    name_nl: '',
    name_en: '',
    description: '',
    sort_order: 0,
    is_active: true,
  })

  useEffect(() => {
    if (item) {
      setFormData(item)
    } else {
      setFormData({
        category: '',
        code: '',
        name_nl: '',
        name_en: '',
        description: '',
        sort_order: 0,
        is_active: true,
      })
    }
  }, [item, show])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{item ? 'Edit' : 'Add'} Reference Data</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Category *</Form.Label>
                <Form.Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace(/_/g, ' ')}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Code *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Name (NL) *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name_nl}
                  onChange={(e) => setFormData({ ...formData, name_nl: e.target.value })}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Name (EN)</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name_en || ''}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Form.Group>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Sort Order</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default ReferenceDataManagement
